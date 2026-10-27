import { NextResponse } from 'next/server';
import { getWcMode } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mode = getWcMode();

  const configChecks = {
    baseUrl: Boolean(process.env.WP_JSON_URL || process.env.WC_BASE_URL || process.env.WP_API_URL),
    consumerKey: Boolean(process.env.WC_CONSUMER_KEY),
    consumerSecret: Boolean(process.env.WC_CONSUMER_SECRET),
    mercadopagoToken: Boolean(process.env.MP_ACCESS_TOKEN),
    webhookSecret: Boolean(process.env.MP_WEBHOOK_SECRET),
  };

  let woocommerceReachable: boolean | null = null;
  let latencyMs: number | null = null;

  if (mode === 'live') {
    const rawUrl = process.env.WP_JSON_URL || process.env.WC_BASE_URL || process.env.WP_API_URL || '';
    const baseUrl = rawUrl.replace(/\/$/, '');
    const url = (baseUrl.includes('/wp-json') ? baseUrl : `${baseUrl}/wp-json`) + '/wc/v3/products/categories?per_page=1';

    const key = process.env.WC_CONSUMER_KEY || '';
    const secret = process.env.WC_CONSUMER_SECRET || '';
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');

    const start = Date.now();
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Basic ${auth}` },
        signal: AbortSignal.timeout(3000),
        cache: 'no-store',
      });
      latencyMs = Date.now() - start;
      woocommerceReachable = res.ok;
    } catch {
      latencyMs = Date.now() - start;
      woocommerceReachable = false;
    }
  }

  const ok = mode === 'mock' ? true : Boolean(woocommerceReachable);

  return NextResponse.json({
    ok,
    mode,
    checks: {
      config: configChecks,
      woocommerceReachable,
      latencyMs,
    },
  });
}
