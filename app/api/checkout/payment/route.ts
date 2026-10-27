import { NextRequest, NextResponse } from 'next/server';
import { mpCreatePreference } from '@/lib/mp/client';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { wcGetOrder, wcUpdateOrder } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

// Estados en los que todavía tiene sentido iniciar un pago.
const PAYABLE_STATUSES = new Set(['pending', 'on-hold', 'failed']);

function siteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`payment:${ip}`, 10, 60_000);
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

    const orderId = Number(body?.order_id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ ok: false, error: 'order_id inválido' }, { status: 400 });
    }

    // El monto sale SIEMPRE de WooCommerce. Nunca del cliente: aceptar
    // `totals.grandTotal` del body permitía pagar $1 por una orden de $120.000.
    const order = await wcGetOrder(orderId);
    if (!order?.id) {
      return NextResponse.json({ ok: false, error: 'Pedido no encontrado' }, { status: 404 });
    }
    if (!PAYABLE_STATUSES.has(String(order.status))) {
      return NextResponse.json(
        { ok: false, error: `El pedido está en estado "${order.status}" y no admite pago` },
        { status: 409 }
      );
    }

    const total = Number(order.total);
    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ ok: false, error: 'El pedido no tiene un total válido' }, { status: 422 });
    }

    const currency = order.currency || 'UYU';
    // El email también lo manda WooCommerce: el del body no es confiable.
    const payerEmail = order.billing?.email || body?.payer?.email || undefined;
    const payer = {
      email: payerEmail,
      name: body?.payer?.name,
      surname: body?.payer?.surname,
    };

    const success = process.env.MP_SUCCESS_URL || '/checkout/exito';
    const failure = process.env.MP_FAILURE_URL || '/checkout/error';
    const pending = process.env.MP_PENDING_URL || '/checkout/pendiente';

    // `order_key` es el secreto por pedido que habilita consultar el estado en
    // /api/orders/[id] sin exponer la orden a cualquiera que enumere IDs.
    const backUrl = (path: string) => {
      const qs = new URLSearchParams({ order_id: String(orderId) });
      if (order.order_key) qs.set('key', order.order_key);
      return siteUrl(`${path}?${qs.toString()}`);
    };

    const payload = {
      external_reference: String(orderId),
      items: [
        {
          title: `Pedido #${orderId}`,
          quantity: 1,
          currency_id: currency,
          unit_price: total,
        },
      ],
      payer,
      back_urls: {
        success: backUrl(success),
        failure: backUrl(failure),
        pending: backUrl(pending),
      },
      auto_return: 'approved',
      // El secreto del webhook ya no viaja en la URL: las notificaciones se
      // validan con la firma HMAC `x-signature` que manda Mercado Pago.
      notification_url: siteUrl('/api/webhooks/mercadopago'),
    };

    const pref = await mpCreatePreference(payload);
    await wcUpdateOrder(orderId, { meta_data: [{ key: 'mp_preference_id', value: pref.id }] });

    return NextResponse.json({ ok: true, init_point: pref.init_point, preference_id: pref.id });
  } catch (err) {
    console.error('checkout/payment POST error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
