import { NextRequest, NextResponse } from 'next/server';
import { quoteShipping } from '@/lib/shipping/rules';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const subtotal = items.reduce((a: number, b: any) => a + (Number(b.price)||0) * (Number(b.quantity)||1), 0);
    const destination = body?.destination || {};

    const shipping = quoteShipping({ subtotal, destination });

    const totals = {
      items: subtotal,
      shipping: shipping.total,
      discount: 0,
      grandTotal: subtotal + shipping.total,
    };

    return NextResponse.json({ ok: true, totals, shipping });
  } catch (err) {
    console.error('validate-cart error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
