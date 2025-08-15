import { NextRequest, NextResponse } from 'next/server';
import { wcFetchProductById, wcFirstImage } from '@/lib/woocommerce';
import { quoteShipping } from '@/lib/shipping/rules';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache por 1 minuto para mejorar rendimiento

type ReqItem = { product_id: number | string; quantity?: number };

// Cache en memoria para productos frecuentemente consultados
const productCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const getCachedProduct = async (productId: number | string) => {
  const key = String(productId);
  const cached = productCache.get(key);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const product = await wcFetchProductById(productId);
    if (product) {
      productCache.set(key, { data: product, timestamp: Date.now() });
    }
    return product;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: ReqItem[] = Array.isArray(body?.items) ? body.items : [];
    
    if (!items.length) {
      return NextResponse.json({ 
        ok: true, 
        items: [], 
        totals: { items: 0, shipping: 0, discount: 0, grandTotal: 0 }, 
        shipping: { method_id: 'flat_rate_free', method_title: 'Envío gratis', total: 0 } 
      });
    }

    // Obtener productos en paralelo con cache
    const products = await Promise.all(
      items.map(async (item) => {
        const product = await getCachedProduct(item.product_id);
        return { req: item, p: product };
      })
    );

    const expanded = products
      .filter(({ p }) => !!p)
      .map(({ req, p }) => {
        const qty = Math.max(1, Number(req.quantity || 1));
        const price = Number.parseFloat(p.price || p.regular_price || '0') || 0;
        const lineTotal = price * qty;
        
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: wcFirstImage(p),
          price,
          quantity: qty,
          lineTotal,
        };
      });

    // Calcular totales
    const subtotal = expanded.reduce((acc, item) => acc + item.lineTotal, 0);
    const shipping = quoteShipping({ subtotal });
    const totals = { 
      items: subtotal, 
      shipping: shipping.total, 
      discount: 0, 
      grandTotal: subtotal + shipping.total 
    };

    // Headers para optimizar cache del navegador
    const response = NextResponse.json({ 
      ok: true, 
      items: expanded, 
      totals, 
      shipping,
      meta: {
        timestamp: Date.now(),
        cart_hash: Buffer.from(JSON.stringify(items)).toString('base64').slice(0, 10)
      }
    });

    response.headers.set('Cache-Control', 'private, max-age=30'); // Cache 30 segundos en el navegador
    
    return response;

  } catch (err) {
    console.error('checkout/summary error:', err);
    return NextResponse.json({ 
      ok: false, 
      error: 'Error al procesar el resumen del carrito'
    }, { status: 500 });
  }
}
