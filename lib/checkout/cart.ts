import { quoteShipping, type ShippingQuote } from '@/lib/shipping/rules';
import { wcFetchProductById, wcFirstImage } from '@/lib/woocommerce';

export type CartItemInput = {
  product_id: number | string;
  quantity?: number;
};

export type CartLine = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type CartMissing = {
  product_id: string;
  reason: 'invalid_id' | 'not_found' | 'too_many_lines';
};

export type CartSummary = {
  items: CartLine[];
  missing: CartMissing[];
  totals: {
    items: number;
    shipping: number;
    discount: number;
    grandTotal: number;
  };
  shipping: ShippingQuote;
};

const MAX_DISTINCT_LINES = 50;
const MAX_QUANTITY = 99;

function clampQuantity(qty: unknown): number {
  const num = typeof qty === 'number' ? qty : Number(qty);
  if (!Number.isFinite(num) || num < 1) return 1;
  return Math.min(MAX_QUANTITY, Math.floor(num));
}

function parseNumericId(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0) return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    }
  }
  return null;
}

export async function buildCartSummary(input: CartItemInput[]): Promise<CartSummary> {
  const items: CartLine[] = [];
  const missing: CartMissing[] = [];

  if (!Array.isArray(input) || input.length === 0) {
    const emptyShipping = quoteShipping({ subtotal: 0 });
    return {
      items: [],
      missing: [],
      totals: { items: 0, shipping: emptyShipping.total, discount: 0, grandTotal: emptyShipping.total },
      shipping: emptyShipping,
    };
  }

  // Agrupar cantidades por ID de producto
  const groupedQuantities = new Map<number, number>();
  const idOrder: number[] = [];

  for (const entry of input) {
    const parsedId = parseNumericId(entry?.product_id);
    if (parsedId === null) {
      missing.push({
        product_id: String(entry?.product_id ?? ''),
        reason: 'invalid_id',
      });
      continue;
    }

    if (!groupedQuantities.has(parsedId)) {
      if (idOrder.length >= MAX_DISTINCT_LINES) {
        missing.push({
          product_id: String(parsedId),
          reason: 'too_many_lines',
        });
        continue;
      }
      idOrder.push(parsedId);
      groupedQuantities.set(parsedId, 0);
    }

    const currentQty = groupedQuantities.get(parsedId) || 0;
    const addedQty = clampQuantity(entry?.quantity);
    groupedQuantities.set(parsedId, Math.min(MAX_QUANTITY, currentQty + addedQty));
  }

  // Consultar productos en paralelo
  const fetched = await Promise.all(
    idOrder.map(async (id) => {
      const product = await wcFetchProductById(id);
      return { id, product };
    })
  );

  for (const { id, product } of fetched) {
    if (!product) {
      missing.push({
        product_id: String(id),
        reason: 'not_found',
      });
      continue;
    }

    const qty = groupedQuantities.get(id) || 1;
    const price = Number.parseFloat(product.price || product.regular_price || '0') || 0;
    const lineTotal = price * qty;

    items.push({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: wcFirstImage(product),
      price,
      quantity: qty,
      lineTotal,
    });
  }

  const itemsSubtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const shipping = quoteShipping({ subtotal: itemsSubtotal });
  const grandTotal = itemsSubtotal + shipping.total;

  return {
    items,
    missing,
    totals: {
      items: itemsSubtotal,
      shipping: shipping.total,
      discount: 0,
      grandTotal,
    },
    shipping,
  };
}
