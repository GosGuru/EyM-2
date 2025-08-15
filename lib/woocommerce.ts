// Minimal WooCommerce REST client for headless WordPress/WooCommerce
// Required envs:
// - WP_JSON_URL (e.g. http://localhost:8882/wp-json)
// - WC_CONSUMER_KEY
// - WC_CONSUMER_SECRET
//
// Notes:
// - On Vercel, set these in Project Settings > Environment Variables.
// - For local dev, add to .env.local.

import { mockWcCategories, mockWcProducts } from './mockData.js';

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

// Verificar si WooCommerce está configurado correctamente
function isWcAvailable(): boolean {
  const hasUrl = !!(process.env.WP_JSON_URL || process.env.WP_API_URL || process.env.WC_BASE_URL);
  const hasKeys = !!(process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET);
  return hasUrl && hasKeys;
}

function getBase(): string {
  const raw = process.env.WP_JSON_URL || process.env.WP_API_URL || process.env.WC_BASE_URL; // added WC_BASE_URL support
  if (!raw) {
    // Durante el build, no fallar - usar placeholder
    if (typeof window === 'undefined') {
      console.warn('⚠️ WP_JSON_URL no configurado, usando placeholder para build');
      return 'https://placeholder.local/wp-json';
    }
    throw new Error("WP_JSON_URL is not set");
  }
  const base = raw.replace(/\/$/, "");
  // Ensure it includes /wp-json
  return base.includes('/wp-json') ? base : `${base}/wp-json`;
}

function getAuth(): string {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!key || !secret) {
    // Durante el build, no fallar - usar placeholder
    if (typeof window === 'undefined') {
      console.warn('⚠️ WooCommerce keys no configuradas, usando placeholder para build');
      return 'Basic placeholder-auth';
    }
    throw new Error("WooCommerce keys are missing (WC_CONSUMER_KEY/WC_CONSUMER_SECRET)");
  }
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
  try {
    // Durante el build o si WooCommerce no está configurado, usar mock data
    if (!isWcAvailable() || typeof window === 'undefined') {
      console.warn('🔧 WooCommerce no configurado o build time, usando datos mock');
      
      let products = [...mockWcProducts];
      
      // Filtrar por categoría si se especifica
      if (params.category) {
        products = products.filter(p => 
          p.categories?.some(c => c.id === params.category || c.slug === params.category)
        );
      }
      
      // Filtrar productos destacados (simulamos con los últimos productos)
      if (params.featured) {
        products = products.slice(-4); // Los últimos 4 como "destacados"
      }
      
      // Limitar cantidad
      if (params.per_page) {
        products = products.slice(0, params.per_page);
      }
      
      return products;
    }

    const search = new URLSearchParams();
    if (params.per_page) search.set('per_page', String(params.per_page));
    if (params.category) search.set('category', String(params.category));
    if (typeof params.featured === 'boolean') search.set('featured', String(params.featured));
    
    // Reducir payload - solo campos necesarios
    search.set('_fields', 'id,name,slug,price,regular_price,sale_price,images,categories,short_description');
    
    const qs = search.toString();
    const revalidate = params.revalidate ?? 300; // 5 minutos por defecto
    return wcFetch<WcProduct[]>(`/products${qs ? `?${qs}` : ''}`, { revalidate });
  } catch (error) {
    console.warn('❌ Error fetching WooCommerce products, usando mock data:', error);
    return mockWcProducts.slice(0, params.per_page || 8);
  }
}

export async function wcFetchProductBySlug(slug: string): Promise<WcProduct | null> {
  try {
    // Durante el build o si WooCommerce no está configurado, usar mock data
    if (!isWcAvailable() || typeof window === 'undefined') {
      console.warn('🔧 WooCommerce no configurado o build time, buscando producto mock por slug:', slug);
      return mockWcProducts.find(p => p.slug === slug) || null;
    }

    const items = await wcFetch<WcProduct[]>(`/products?slug=${encodeURIComponent(slug)}`);
    return items[0] ?? null;
  } catch (error) {
    console.warn('❌ Error fetching product by slug, usando mock data:', error);
    return mockWcProducts.find(p => p.slug === slug) || null;
  }
}

export async function wcFetchCategories(revalidate: number = 300): Promise<WcCategory[]> {
  try {
    // Durante el build o si WooCommerce no está configurado, usar mock data
    if (!isWcAvailable() || typeof window === 'undefined') {
      console.warn('🔧 WooCommerce no configurado o build time, usando categorías mock');
      return mockWcCategories;
    }

    // Reducir payload - solo campos necesarios  
    return wcFetch<WcCategory[]>(`/products/categories?per_page=100&_fields=id,name,slug,image`, { revalidate });
  } catch (error) {
    console.warn('❌ Error fetching WooCommerce categories, usando mock data:', error);
    return mockWcCategories;
  }
}

export function wcFirstImage(p?: WcProduct): string | null {
  return p?.images?.[0]?.src || null;
}

export async function wcFetchProductById(id: number | string): Promise<WcProduct | null> {
  try {
    // Durante el build o si WooCommerce no está configurado, usar mock data
    if (!isWcAvailable() || typeof window === 'undefined') {
      console.warn('🔧 WooCommerce no configurado o build time, buscando producto mock por ID:', id);
      return mockWcProducts.find(p => p.id === Number(id)) || null;
    }

    const item = await wcFetch<WcProduct>(`/products/${id}`);
    return item ?? null;
  } catch (error) {
    console.warn('❌ Error fetching product by ID, usando mock data:', error);
    return mockWcProducts.find(p => p.id === Number(id)) || null;
  }
}

export async function wcFindCategoryBySlug(slug: string): Promise<WcCategory | null> {
  try {
    // Durante el build o si WooCommerce no está configurado, usar mock data
    if (!isWcAvailable() || typeof window === 'undefined') {
      console.warn('🔧 WooCommerce no configurado o build time, buscando categoría mock por slug:', slug);
      return mockWcCategories.find(c => c.slug === slug) || null;
    }

    const cats = await wcFetchCategories();
    return cats.find(c => c.slug === slug) || null;
  } catch (error) {
    console.warn('❌ Error finding category by slug, usando mock data:', error);
    return mockWcCategories.find(c => c.slug === slug) || null;
  }
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
