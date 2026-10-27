import { NextRequest, NextResponse } from 'next/server';
import { mpGetMerchantOrder, mpGetPayment } from '@/lib/mp/client';
import { amountsMatch, verifyMpSignature } from '@/lib/mp/webhook';
import { wcGetOrder, wcUpdateOrder } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

// Idempotencia por instancia. En producción conviene un store durable, pero el
// estado real siempre se re-consulta a Mercado Pago, así que un duplicado es inocuo.
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

type Notification = {
  type: string;
  dataId: string;
};

function readNotification(req: NextRequest, rawBody: string): Notification {
  let body: any = {};
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    body = {};
  }

  const url = new URL(req.url);
  const type = String(
    body?.type || body?.topic || url.searchParams.get('type') || url.searchParams.get('topic') || ''
  );
  const dataId = String(
    body?.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? ''
  );

  return { type, dataId };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const { type, dataId } = readNotification(req, rawBody);

    // Notificación vacía: se acusa recibo para cortar los reintentos de MP.
    if (!type || !dataId) {
      return NextResponse.json({ ok: true, ignored: 'missing_type_or_id' });
    }

    // Sin secreto no hay forma de distinguir una notificación real de una falsa:
    // se falla cerrado en vez de aceptar cualquier POST.
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[mp-webhook] MP_WEBHOOK_SECRET no configurado: notificación rechazada');
      return NextResponse.json({ ok: false, error: 'webhook not configured' }, { status: 503 });
    }

    const signatureValid = verifyMpSignature({
      xSignature: req.headers.get('x-signature'),
      xRequestId: req.headers.get('x-request-id'),
      dataId,
      secret,
    });
    if (!signatureValid) {
      console.warn('[mp-webhook] firma inválida, notificación descartada', { type, dataId });
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 });
    }

    let external_reference: string | undefined;
    let status: string | undefined;
    let payment_id: string | undefined;
    let payer_email: string | undefined;
    let paidAmount: unknown;

    if (type.includes('merchant_order')) {
      const mo = await mpGetMerchantOrder(dataId);
      external_reference = mo.external_reference;
      status = mo.order_status || mo.payments?.[0]?.status;
      payment_id = mo.payments?.[0]?.id;
      payer_email = mo.payer?.email;
      paidAmount = mo.paid_amount ?? mo.total_amount;
    } else {
      const p = await mpGetPayment(dataId);
      external_reference = p.external_reference;
      status = p.status;
      payment_id = p.id;
      payer_email = p.payer?.email;
      paidAmount = p.transaction_amount;
    }

    if (!external_reference) {
      return NextResponse.json({ ok: true, ignored: 'no_external_reference' });
    }

    const wcStatus = mapStatus(String(status || 'pending'));
    const idempotencyKey = `${type}:${dataId}:${wcStatus}`;
    if (processed.has(idempotencyKey)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const order = await wcGetOrder(external_reference);

    // Marcar como pagado solo si lo cobrado coincide con el total real del pedido.
    if (wcStatus === 'processing' && !amountsMatch(order?.total, paidAmount)) {
      console.warn('[mp-webhook] monto no coincide con la orden, no se marca como pagada', {
        orderId: external_reference,
        orderTotal: order?.total,
        paidAmount,
        paymentId: payment_id,
      });
      return NextResponse.json({ ok: true, ignored: 'amount_mismatch' });
    }

    await wcUpdateOrder(external_reference, {
      status: wcStatus,
      meta_data: [
        { key: 'mp_webhook_status', value: status },
        { key: 'mp_webhook_id', value: dataId },
        { key: 'mp_webhook_type', value: type },
        ...(payment_id ? [{ key: 'mp_payment_id', value: payment_id }] : []),
        ...(payer_email ? [{ key: 'mp_payer_email', value: payer_email }] : []),
      ],
    });

    processed.add(idempotencyKey);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('MP webhook error', err);
    // Se responde 200 para evitar tormentas de reintentos; el error queda en logs.
    return NextResponse.json({ ok: true });
  }
}
