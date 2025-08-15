// Minimal WooCommerce REST client for headless WordPress/WooCommerce
// Required envs:
// - WP_JSON_URL (e.g. http://localhost:8882/wp-json)
// - WC_CONSUMER_KEY
// - WC_CONSUMER_SECRET
//
// Notes:
// - On Vercel, set these in Project Settings > Environment Variables.
// - For local dev, add to .env.local.

export type WcProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  images?: { src: string; alt?: string }[];
  categories?: { id: number; name: string; slug: string }[];
  description?: string;
  short_description?: string;
};

export type WcCategory = {
  id: number;
  name: string;
  slug: string;
  image?: { src: string } | null;
};

function getBase(): string {
  const raw = process.env.WP_JSON_URL || process.env.WP_API_URL || process.env.WC_BASE_URL; // added WC_BASE_URL support
  if (!raw) throw new Error("WP_JSON_URL is not set");
  const base = raw.replace(/\/$/, "");
  // Ensure it includes /wp-json
  return base.includes('/wp-json') ? base : `${base}/wp-json`;
}

function getAuth(): string {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("WooCommerce keys are missing (WC_CONSUMER_KEY/WC_CONSUMER_SECRET)");
  // Basic auth header
  const token = Buffer.from(`${key}:${secret}`).toString('base64');
  return `Basic ${token}`;
}

// Simple dev-time memoization to avoid hammering WP when HMR triggers frequently
// Uses a global Map so it survives module reloads in Next dev server
const __DEV_WC_CACHE__ = (globalThis as any).__DEV_WC_CACHE__ || new Map<string, { t: number; data?: any; promise?: Promise<any> }>();
(globalThis as any).__DEV_WC_CACHE__ = __DEV_WC_CACHE__;

async function wcFetch<T>(path: string, init?: RequestInit & { revalidate?: number }) {
  const base = getBase();
  const url = `${base}/wc/v3${path}`;
  const revalidate = init?.revalidate ?? 60;

  // In dev, dedupe and throttle identical requests for a short TTL
  if (process.env.NODE_ENV !== 'production' && (!init?.method || init?.method.toUpperCase() === 'GET')) {
    const ttlMs = Number(process.env.WC_DEV_TTL_MS || 10000); // default 10s
    const key = `${init?.method || 'GET'} ${url} ${init?.body ? JSON.stringify(init.body) : ''}`;
    const hit = __DEV_WC_CACHE__.get(key);
    const now = Date.now();
    if (hit) {
      if (hit.promise) return hit.promise as Promise<T>;
      if (hit.data && now - hit.t < ttlMs) return hit.data as T;
    }
    const p = (async () => {
      const res = await fetch(url, {
        headers: { Authorization: getAuth() },
        cache: init?.method ? 'no-store' : 'force-cache',
        next: { revalidate },
        ...init,
      });
      if (!res.ok) throw new Error(`WooCommerce fetch failed ${res.status}: ${url}`);
      const json = (await res.json()) as T;
      __DEV_WC_CACHE__.set(key, { t: Date.now(), data: json });
      return json;
    })();
    __DEV_WC_CACHE__.set(key, { t: now, promise: p });
    return p;
  }

  // Production: rely on Next.js cache/ISR
  const res = await fetch(url, {
    headers: { Authorization: getAuth() },
    cache: init?.method ? 'no-store' : 'force-cache',
    next: { revalidate },
    ...init,
  });
  if (!res.ok) throw new Error(`WooCommerce fetch failed ${res.status}: ${url}`);
  return (await res.json()) as T;
}

export async function wcFetchProducts(params: { per_page?: number; category?: number | string; featured?: boolean; revalidate?: number } = {}): Promise<WcProduct[]> {
  const search = new URLSearchParams();
  if (params.per_page) search.set('per_page', String(params.per_page));
  if (params.category) search.set('category', String(params.category));
  if (typeof params.featured === 'boolean') search.set('featured', String(params.featured));
  
  // Reducir payload - solo campos necesarios
  search.set('_fields', 'id,name,slug,price,regular_price,sale_price,images,categories,short_description');
  
  const qs = search.toString();
  const revalidate = params.revalidate ?? 300; // 5 minutos por defecto
  return wcFetch<WcProduct[]>(`/products${qs ? `?${qs}` : ''}`, { revalidate });
}

export async function wcFetchProductBySlug(slug: string): Promise<WcProduct | null> {
  const items = await wcFetch<WcProduct[]>(`/products?slug=${encodeURIComponent(slug)}`);
  return items[0] ?? null;
}

export async function wcFetchCategories(revalidate: number = 300): Promise<WcCategory[]> {
  // Reducir payload - solo campos necesarios  
  return wcFetch<WcCategory[]>(`/products/categories?per_page=100&_fields=id,name,slug,image`, { revalidate });
}

export function wcFirstImage(p?: WcProduct): string | null {
  return p?.images?.[0]?.src || null;
}

export async function wcFetchProductById(id: number | string): Promise<WcProduct | null> {
  try {
    const item = await wcFetch<WcProduct>(`/products/${id}`);
    return item ?? null;
  } catch {
    return null;
  }
}

export async function wcFindCategoryBySlug(slug: string): Promise<WcCategory | null> {
  const cats = await wcFetchCategories();
  return cats.find(c => c.slug === slug) || null;
}

// Orders (minimal)
export type WcOrderCustomer = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode?: string;
  country?: string;
};

export type WcOrder = {
  id: number;
  status: string;
  total: string;
  currency: string;
  line_items: Array<{ product_id: number; variation_id?: number; quantity: number; total?: string; price?: string }>;
  shipping_lines?: Array<{ method_id: string; method_title: string; total: string }>;
  billing?: Partial<WcOrderCustomer>;
  shipping?: Partial<WcOrderCustomer>;
  meta_data?: Array<{ key: string; value: any }>;
};

export async function wcCreateOrder(payload: Partial<WcOrder>): Promise<WcOrder> {
  return wcFetch<WcOrder>(`/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: getAuth() },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
}

export async function wcUpdateOrder(id: number | string, payload: Partial<WcOrder>): Promise<WcOrder> {
  return wcFetch<WcOrder>(`/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: getAuth() },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
}

export async function wcGetOrder(id: number | string): Promise<WcOrder> {
  return wcFetch<WcOrder>(`/orders/${id}`, { cache: 'no-store' });
}

export async function wcAddOrderMeta(id: number | string, meta: Record<string, any>): Promise<WcOrder> {
  const meta_data = Object.entries(meta).map(([key, value]) => ({ key, value }));
  return wcUpdateOrder(id, { meta_data });
}
