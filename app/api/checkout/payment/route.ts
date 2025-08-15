import { NextRequest, NextResponse } from 'next/server';
import { mpCreatePreference } from '@/lib/mp/client';
import { wcUpdateOrder } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

function siteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order_id = body?.order_id;
    const totals = body?.totals;
    const payer = body?.payer || {};

    if (!order_id || !totals?.grandTotal) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

  const success = process.env.MP_SUCCESS_URL || '/checkout/exito';
  const failure = process.env.MP_FAILURE_URL || '/checkout/error';
  const pending = process.env.MP_PENDING_URL || '/checkout/pendiente';

  const payload = {
      external_reference: String(order_id),
      items: [
        { title: `Pedido #${order_id}`, quantity: 1, currency_id: 'UYU', unit_price: Number(totals.grandTotal) },
      ],
      payer: {
        email: payer.email,
        name: payer.name,
        surname: payer.surname,
      },
      back_urls: {
        success: siteUrl(`${success}?order_id=${order_id}`),
        failure: siteUrl(`${failure}?order_id=${order_id}`),
        pending: siteUrl(`${pending}?order_id=${order_id}`),
      },
      auto_return: 'approved',
      // Opcional: agregar token de verificación simple para el webhook si existe MP_WEBHOOK_SECRET
      notification_url: (() => {
        const token = process.env.MP_WEBHOOK_SECRET;
        const base = '/api/webhooks/mercadopago';
        return siteUrl(token ? `${base}?token=${encodeURIComponent(token)}` : base);
      })(),
    };

  const pref = await mpCreatePreference(payload);
  // Persist preference_id on Woo order meta
  await wcUpdateOrder(order_id, { meta_data: [ { key: 'mp_preference_id', value: pref.id } ] });
  return NextResponse.json({ ok: true, init_point: pref.init_point, preference_id: pref.id });
  } catch (err) {
    console.error('checkout/payment POST error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
