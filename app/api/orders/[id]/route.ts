import { NextRequest, NextResponse } from 'next/server';
import { wcGetOrder } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await wcGetOrder(params.id);
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    console.error('orders/:id GET error', err);
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }
}
