import { NextRequest, NextResponse } from 'next/server';
import { wcCreateOrder, WcOrder } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Basic validation
    if (!Array.isArray(body?.items) || !body?.customer) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    const line_items = body.items.map((it: any) => ({
      product_id: Number(it.product_id),
      variation_id: it.variation_id ? Number(it.variation_id) : undefined,
      quantity: Math.max(1, Number(it.quantity || 1)),
    }));

    const shipping_lines = body.shippingLine ? [{
      method_id: String(body.shippingLine.method_id),
      method_title: String(body.shippingLine.method_title || body.shippingLine.method_id),
      total: String(body.shippingLine.total ?? 0),
    }] : [];

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

  return NextResponse.json({ ok: true, order_id: order.id, status: order.status });
  } catch (err: any) {
    console.error('checkout/order POST error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
