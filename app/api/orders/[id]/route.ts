import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { wcGetOrder } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

// Proyección pública: solo lo que la pantalla de confirmación necesita.
// Nunca se devuelve la orden completa (dirección, teléfono, email, billing).
function publicOrder(order: any) {
  return {
    id: order.id,
    status: order.status,
    total: order.total,
    currency: order.currency,
    line_items: (Array.isArray(order.line_items) ? order.line_items : []).map((li: any) => ({
      name: li?.name,
      quantity: li?.quantity,
    })),
  };
}

function keyMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Sin `order_key` no se consulta nada: el ID numérico es enumerable y por sí
  // solo no prueba que quien pregunta sea el dueño del pedido.
  const key = req.nextUrl.searchParams.get('key') || '';
  if (!/^\d+$/.test(id) || !key) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  try {
    const order = await wcGetOrder(id);
    if (!order?.order_key || !keyMatches(key, order.order_key)) {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, order: publicOrder(order) });
  } catch (err) {
    console.error('orders/:id GET error', err);
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }
}
