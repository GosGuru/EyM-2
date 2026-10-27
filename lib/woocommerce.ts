// Minimal WooCommerce REST client for headless WordPress/WooCommerce
// Required envs:
// - WP_JSON_URL or WC_BASE_URL (e.g. http://localhost:8882/wp-json)
// - WC_CONSUMER_KEY
// - WC_CONSUMER_SECRET

import { mockWcCategories, mockWcProducts } from './mockData.js';

export type WcMode = 'live' | 'mock';

export type WcProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  images?: { src: string; alt?: string }[];
  categories?: { id: number; name: string; slug: string }[];
  description?: string;
  short_description?: string;
};

export type WcCategory = {
  id: number;
  name: string;
  slug: string;
  image?: { src: string } | null;
};

export type WcOrderCustomer = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode?: string;
  country?: string;
};

export type WcOrder = {
  id: number;
  status: string;
  total: string;
  currency: string;
  /** Secreto por pedido: habilita consultar el estado sin exponer la orden. */
  order_key?: string;
  line_items: Array<{ product_id: number; variation_id?: number; quantity: number; total?: string; price?: string }>;
  shipping_lines?: Array<{ method_id: string; method_title: string; total: string }>;
  billing?: Partial<WcOrderCustomer>;
  shipping?: Partial<WcOrderCustomer>;
  meta_data?: Array<{ key: string; value: any }>;
};

function missingEnvList(): string[] {
  const missing: string[] = [];
  if (!(process.env.WP_JSON_URL || process.env.WC_BASE_URL || process.env.WP_API_URL)) {
    missing.push('WP_JSON_URL/WC_BASE_URL');
  }
  if (!process.env.WC_CONSUMER_KEY) missing.push('WC_CONSUMER_KEY');
  if (!process.env.WC_CONSUMER_SECRET) missing.push('WC_CONSUMER_SECRET');
  return missing;
}

/**
 * Retorna 'live' cuando la URL base y las claves de WooCommerce están configuradas.
 * En cualquier otro caso retorna 'mock'.
 */
export function getWcMode(): WcMode {
  return missingEnvList().length === 0 ? 'live' : 'mock';
}

function warnMock(fnName: string): void {
  const missing = missingEnvList();
  console.warn(
    `[woocommerce] ${fnName}: modo mock activo (faltan variables: ${missing.join(', ')}). Usando datos demo.`
  );
}

function getBase(): string {
  const raw = process.env.WP_JSON_URL || process.env.WC_BASE_URL || process.env.WP_API_URL;
  if (!raw) {
    throw new Error('WP_JSON_URL is not set');
  }
  const base = raw.replace(/\/$/, '');
  return base.includes('/wp-json') ? base : `${base}/wp-json`;
}

function getAuth(): string {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error('WooCommerce keys are missing (WC_CONSUMER_KEY/WC_CONSUMER_SECRET)');
  }
  const token = Buffer.from(`${key}:${secret}`).toString('base64');
  return `Basic ${token}`;
}

async function wcFetch<T>(path: string, init?: RequestInit & { revalidate?: number }): Promise<T> {
  const base = getBase();
  const url = `${base}/wc/v3${path}`;
  const revalidate = init?.revalidate ?? 60;

  const res = await fetch(url, {
    headers: {
      Authorization: getAuth(),
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: init?.method && init.method.toUpperCase() !== 'GET' ? 'no-store' : 'force-cache',
    next: { revalidate },
    ...init,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`WooCommerce API error ${res.status} on ${path}: ${errorBody.slice(0, 200)}`);
  }

  return (await res.json()) as T;
}

// En memoria para modo mock: almacena órdenes creadas durante la sesión demo
const mockOrdersStore = new Map<number, WcOrder>();

export async function wcFetchProducts(
  params: { per_page?: number; category?: number | string; featured?: boolean; revalidate?: number } = {}
): Promise<WcProduct[]> {
  if (getWcMode() === 'mock') {
    warnMock('wcFetchProducts');
    let products = [...mockWcProducts];

    if (params.category) {
      products = products.filter((p) =>
        p.categories?.some((c) => c.id === params.category || c.slug === params.category)
      );
    }
    if (params.featured) {
      products = products.slice(-4);
    }
    if (params.per_page) {
      products = products.slice(0, params.per_page);
    }
    return products;
  }

  // Modo live: sin fallback silencioso ante errores
  const search = new URLSearchParams();
  if (params.per_page) search.set('per_page', String(params.per_page));
  if (params.category) search.set('category', String(params.category));
  if (typeof params.featured === 'boolean') search.set('featured', String(params.featured));
  search.set('_fields', 'id,name,slug,price,regular_price,sale_price,images,categories,short_description');

  const qs = search.toString();
  const revalidate = params.revalidate ?? 300;
  return wcFetch<WcProduct[]>(`/products${qs ? `?${qs}` : ''}`, { revalidate });
}

export async function wcFetchProductBySlug(slug: string): Promise<WcProduct | null> {
  if (getWcMode() === 'mock') {
    warnMock(`wcFetchProductBySlug(${slug})`);
    return mockWcProducts.find((p) => p.slug === slug) || null;
  }

  const items = await wcFetch<WcProduct[]>(`/products?slug=${encodeURIComponent(slug)}`);
  return items[0] ?? null;
}

export async function wcFetchCategories(revalidate = 300): Promise<WcCategory[]> {
  if (getWcMode() === 'mock') {
    warnMock('wcFetchCategories');
    return mockWcCategories;
  }

  return wcFetch<WcCategory[]>(`/products/categories?per_page=100&_fields=id,name,slug,image`, { revalidate });
}

export function wcFirstImage(p?: WcProduct): string | null {
  return p?.images?.[0]?.src || null;
}

export async function wcFetchProductById(id: number | string): Promise<WcProduct | null> {
  if (getWcMode() === 'mock') {
    warnMock(`wcFetchProductById(${id})`);
    return mockWcProducts.find((p) => p.id === Number(id)) || null;
  }

  const item = await wcFetch<WcProduct>(`/products/${id}`);
  return item ?? null;
}

export async function wcFindCategoryBySlug(slug: string): Promise<WcCategory | null> {
  if (getWcMode() === 'mock') {
    warnMock(`wcFindCategoryBySlug(${slug})`);
    return mockWcCategories.find((c) => c.slug === slug) || null;
  }

  const cats = await wcFetchCategories();
  return cats.find((c) => c.slug === slug) || null;
}

export async function wcCreateOrder(payload: Partial<WcOrder>): Promise<WcOrder> {
  if (getWcMode() === 'mock') {
    warnMock('wcCreateOrder');
    const id = Date.now();
    const orderKey = `wc_order_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    const lineItemsTotal = (payload.line_items || []).reduce(
      (sum, li) => sum + Number(li.price || 0) * Number(li.quantity || 1),
      0
    );
    const shippingTotal = (payload.shipping_lines || []).reduce(
      (sum, sl) => sum + Number(sl.total || 0),
      0
    );
    const total = String(lineItemsTotal + shippingTotal);

    const mockOrder: WcOrder = {
      id,
      status: payload.status || 'pending',
      total,
      currency: 'UYU',
      order_key: orderKey,
      line_items: payload.line_items || [],
      shipping_lines: payload.shipping_lines || [],
      billing: payload.billing || {},
      shipping: payload.shipping || {},
      meta_data: payload.meta_data || [],
    };
    mockOrdersStore.set(id, mockOrder);
    return mockOrder;
  }

  return wcFetch<WcOrder>(`/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: getAuth() },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
}

export async function wcUpdateOrder(id: number | string, payload: Partial<WcOrder>): Promise<WcOrder> {
  const numericId = Number(id);
  if (getWcMode() === 'mock') {
    warnMock(`wcUpdateOrder(${id})`);
    const existing = mockOrdersStore.get(numericId) || {
      id: numericId,
      status: 'pending',
      total: '0',
      currency: 'UYU',
      order_key: `wc_order_mock_${numericId}`,
      line_items: [],
    };
    const updated: WcOrder = {
      ...existing,
      ...payload,
      id: numericId,
      meta_data: [...(existing.meta_data || []), ...(payload.meta_data || [])],
    };
    mockOrdersStore.set(numericId, updated);
    return updated;
  }

  return wcFetch<WcOrder>(`/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: getAuth() },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
}

export async function wcGetOrder(id: number | string): Promise<WcOrder> {
  const numericId = Number(id);
  if (getWcMode() === 'mock') {
    warnMock(`wcGetOrder(${id})`);
    const found = mockOrdersStore.get(numericId);
    if (found) return found;
    // Si no fue creada en esta sesión pero se consulta un ID mock (ej. id: 1)
    return {
      id: numericId,
      status: 'pending',
      total: '25000',
      currency: 'UYU',
      order_key: `wc_order_mock_${numericId}`,
      line_items: [{ product_id: 1, quantity: 1, total: '25000', price: '25000' }],
    };
  }

  return wcFetch<WcOrder>(`/orders/${id}`, { cache: 'no-store' });
}

export async function wcAddOrderMeta(id: number | string, meta: Record<string, any>): Promise<WcOrder> {
  const meta_data = Object.entries(meta).map(([key, value]) => ({ key, value }));
  return wcUpdateOrder(id, { meta_data });
}
