import { NextRequest, NextResponse } from 'next/server';
import { mpGetMerchantOrder, mpGetPayment } from '@/lib/mp/client';
import { wcUpdateOrder } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

// In-memory idempotency set (ok for single-instance dev). For prod, use a durable store.
const processed = new Set<string>();

function mapStatus(mpStatus: string) {
  switch (mpStatus) {
    case 'approved':
      return 'processing';
    case 'rejected':
    case 'cancelled':
      return 'cancelled';
    case 'in_process':
    case 'pending':
    default:
      return 'on-hold';
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    // Simple token check (optional). Use a stronger signature verification if available.
    const token = url.searchParams.get('token');
    const expected = process.env.MP_WEBHOOK_SECRET;
    if (expected && token !== expected) {
      // do not reveal details; acknowledge with 401
      return new NextResponse(undefined, { status: 401 });
    }
    const type = url.searchParams.get('type') || url.searchParams.get('topic') || '';
    const id = url.searchParams.get('id') || url.searchParams.get('data.id') || '';

    if (!type || !id) {
      return NextResponse.json({ ok: true }); // acknowledge to avoid retries for junk
    }

    // Idempotency
    const key = `${type}:${id}`;
    if (processed.has(key)) return NextResponse.json({ ok: true, duplicate: true });

  let external_reference: string | undefined;
  let status: string | undefined;
  let payment_id: string | undefined;
  let payer_email: string | undefined;

    if (type.includes('merchant_order')) {
  const mo = await mpGetMerchantOrder(id);
      external_reference = mo.external_reference;
  status = mo.order_status || mo.payments?.[0]?.status;
  payment_id = mo.payments?.[0]?.id;
  payer_email = mo.payer?.email;
    } else if (type.includes('payment')) {
  const p = await mpGetPayment(id);
      external_reference = p.external_reference;
  status = p.status;
  payment_id = p.id;
  payer_email = p.payer?.email;
    } else {
      // Fallback: try payment endpoint
  const p = await mpGetPayment(id);
      external_reference = p.external_reference;
  status = p.status;
  payment_id = p.id;
  payer_email = p.payer?.email;
    }

    if (!external_reference) return NextResponse.json({ ok: true, ignored: true });

    const wcStatus = mapStatus(String(status || 'pending'));

  await wcUpdateOrder(external_reference, {
      status: wcStatus,
      meta_data: [
        { key: 'mp_webhook_status', value: status },
        { key: 'mp_webhook_id', value: id },
        { key: 'mp_webhook_type', value: type },
    ...(payment_id ? [{ key: 'mp_payment_id', value: payment_id }] : []),
    ...(payer_email ? [{ key: 'mp_payer_email', value: payer_email }] : []),
      ],
    });

    processed.add(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('MP webhook error', err);
    return NextResponse.json({ ok: true }); // Always 200 to avoid repeated retries storm
  }
}
