import { NextResponse } from 'next/server';
import { getWcMode } from '@/lib/woocommerce';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const wcMode = getWcMode();
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const configChecks = {
    supabaseUrl: hasSupabase,
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    mercadopagoToken: Boolean(process.env.MP_ACCESS_TOKEN),
    webhookSecret: Boolean(process.env.MP_WEBHOOK_SECRET),
    woocommerceBaseUrl: Boolean(process.env.WP_JSON_URL || process.env.WC_BASE_URL || process.env.WP_API_URL),
    woocommerceConsumerKey: Boolean(process.env.WC_CONSUMER_KEY),
  };

  let supabaseReachable: boolean | null = null;
  let supabaseLatencyMs: number | null = null;

  if (hasSupabase) {
    const start = Date.now();
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('products').select('id').limit(1);
      supabaseLatencyMs = Date.now() - start;
      supabaseReachable = !error;
    } catch {
      supabaseLatencyMs = Date.now() - start;
      supabaseReachable = false;
    }
  }

  const backend = hasSupabase
    ? 'supabase'
    : wcMode === 'live'
    ? 'woocommerce'
    : 'mock';

  const ok = hasSupabase
    ? Boolean(supabaseReachable)
    : wcMode === 'mock'
    ? true
    : false;

  return NextResponse.json({
    ok,
    backend,
    checks: {
      config: configChecks,
      supabaseReachable,
      supabaseLatencyMs,
    },
  });
}
