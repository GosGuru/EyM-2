import { NextResponse } from 'next/server';
import { wcFetchProducts } from '@/lib/woocommerce';

export const revalidate = 0;

export async function GET() {
  try {
    const items = await wcFetchProducts({ per_page: 5 });
    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
