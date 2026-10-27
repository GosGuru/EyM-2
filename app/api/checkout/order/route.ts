import { NextRequest, NextResponse } from 'next/server';
import { buildCartSummary } from '@/lib/checkout/cart';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { wcCreateOrder, WcOrder } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`order:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: 'Demasiados intentos. Probá de nuevo en un momento.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rl.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json();

    if (!Array.isArray(body?.items) || body.items.length === 0 || !body?.customer) {
      return NextResponse.json({ ok: false, error: 'Payload inválido' }, { status: 400 });
    }

    if (body.items.length > 50) {
      return NextResponse.json(
        { ok: false, error: 'El pedido supera el máximo permitido de 50 productos distintos' },
        { status: 400 }
      );
    }

    // El servidor calcula el resumen autoritativo (precios, envío y totales de WooCommerce)
    // El cliente NUNCA decide los montos ni el costo de envío.
    const summary = await buildCartSummary(body.items);

    if (summary.items.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No hay productos válidos en el pedido', missing: summary.missing },
        { status: 400 }
      );
    }

    if (summary.missing.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Algunos productos del carrito no están disponibles o tienen datos inválidos',
          missing: summary.missing,
        },
        { status: 400 }
      );
    }

    const line_items = summary.items.map((it) => ({
      product_id: it.id,
      quantity: it.quantity,
      price: String(it.price),
      total: String(it.lineTotal),
    }));

    const shipping_lines = [
      {
        method_id: summary.shipping.method_id,
        method_title: summary.shipping.method_title,
        total: String(summary.shipping.total),
      },
    ];

    const billing = body.customer?.billing ?? {
      first_name: body.customer.first_name,
      last_name: body.customer.last_name,
      email: body.customer.email,
      phone: body.customer.phone,
      address_1: body.customer.shipping?.address_1,
      address_2: body.customer.shipping?.address_2,
      city: body.customer.shipping?.city,
      state: body.customer.shipping?.state,
      postcode: body.customer.shipping?.postcode,
      country: body.customer.shipping?.country || 'UY',
    };

    const shipping = body.customer?.shipping ?? {
      address_1: body.customer.shipping?.address_1,
      address_2: body.customer.shipping?.address_2,
      city: body.customer.shipping?.city,
      state: body.customer.shipping?.state,
      postcode: body.customer.shipping?.postcode,
      country: body.customer.shipping?.country || 'UY',
      first_name: body.customer.first_name,
      last_name: body.customer.last_name,
      email: body.customer.email,
      phone: body.customer.phone,
    };

    const meta_data = Object.entries(body.meta ?? {}).map(([key, value]) => ({ key, value }));

    const payload: Partial<WcOrder> = {
      status: 'pending',
      line_items,
      shipping_lines,
      billing,
      shipping,
      meta_data,
    };

    const order = await wcCreateOrder(payload);

    return NextResponse.json({
      ok: true,
      order_id: order.id,
      order_key: order.order_key,
      status: order.status,
    });
  } catch (err: any) {
    console.error('checkout/order POST error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
