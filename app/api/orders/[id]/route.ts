import { NextRequest, NextResponse } from 'next/server';
import { wcGetOrder } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params?: Record<string, string> }) {
  try {
    const orderId = context.params?.id;
    if (!orderId) {
      return NextResponse.json({ ok: false, error: 'Order ID missing' }, { status: 400 });
    }
    const order = await wcGetOrder(orderId);
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    console.error('orders/:id GET error', err);
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }
}
