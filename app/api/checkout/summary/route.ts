import { NextRequest, NextResponse } from 'next/server';
import { buildCartSummary, type CartItemInput } from '@/lib/checkout/cart';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: CartItemInput[] = Array.isArray(body?.items) ? body.items : [];

    if (!items.length) {
      return NextResponse.json({
        ok: true,
        items: [],
        missing: [],
        totals: { items: 0, shipping: 0, discount: 0, grandTotal: 0 },
        shipping: { method_id: 'flat_rate_free', method_title: 'Envío gratis', total: 0 },
      });
    }

    const summary = await buildCartSummary(items);

    const response = NextResponse.json({
      ok: true,
      items: summary.items,
      missing: summary.missing,
      totals: summary.totals,
      shipping: summary.shipping,
      meta: {
        timestamp: Date.now(),
        cart_hash: Buffer.from(JSON.stringify(items)).toString('base64').slice(0, 10),
      },
    });

    response.headers.set('Cache-Control', 'private, max-age=30');
    return response;
  } catch (err) {
    console.error('checkout/summary error:', err);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al procesar el resumen del carrito',
      },
      { status: 500 }
    );
  }
}
