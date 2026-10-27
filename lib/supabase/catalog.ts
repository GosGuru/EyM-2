import { createClient } from './server';
import { mockWcProducts, mockWcCategories } from '../mockData.js';
import type { WcProduct, WcCategory, WcOrder } from '../woocommerce';

function fallbackMockProducts(params: { category?: string | number; featured?: boolean; per_page?: number } = {}) {
  let fallback = [...mockWcProducts];
  if (params.category) {
    fallback = fallback.filter(p => p.categories?.some(c => c.slug === params.category || c.id === params.category));
  }
  if (params.featured) {
    fallback = fallback.slice(-4);
  }
  if (params.per_page) {
    fallback = fallback.slice(0, params.per_page);
  }
  return fallback;
}

export async function fetchCatalogProducts(params: {
  category?: string | number;
  featured?: boolean;
  per_page?: number;
} = {}): Promise<WcProduct[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from('products').select('*').eq('active', true).order('id', { ascending: false });

    if (params.category) {
      query = query.eq('category_slug', String(params.category));
    }
    if (params.featured) {
      query = query.eq('featured', true);
    }
    if (params.per_page) {
      query = query.limit(params.per_page);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return fallbackMockProducts(params);
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: String(row.price),
      regular_price: row.regular_price ? String(row.regular_price) : undefined,
      sale_price: row.sale_price ? String(row.sale_price) : undefined,
      description: row.description || '',
      short_description: row.short_description || '',
      images: Array.isArray(row.images) ? row.images : [],
      categories: row.category_slug ? [{ id: 1, name: row.category_slug, slug: row.category_slug }] : [],
    }));
  } catch {
    return fallbackMockProducts(params);
  }
}

export async function fetchCatalogProductBySlug(slug: string): Promise<WcProduct | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();

    if (error || !data) {
      return mockWcProducts.find(p => p.slug === slug) || null;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      price: String(data.price),
      regular_price: data.regular_price ? String(data.regular_price) : undefined,
      sale_price: data.sale_price ? String(data.sale_price) : undefined,
      description: data.description || '',
      short_description: data.short_description || '',
      images: Array.isArray(data.images) ? data.images : [],
      categories: data.category_slug ? [{ id: 1, name: data.category_slug, slug: data.category_slug }] : [],
    };
  } catch {
    return mockWcProducts.find(p => p.slug === slug) || null;
  }
}

export async function fetchCatalogCategories(): Promise<WcCategory[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      return mockWcCategories;
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      image: row.image ? { src: row.image } : null,
    }));
  } catch {
    return mockWcCategories;
  }
}

export async function createCatalogOrder(payload: Partial<WcOrder>): Promise<WcOrder> {
  const orderKey = `order_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_key: orderKey,
        status: payload.status || 'pending',
        total: Number(payload.total || 0),
        currency: payload.currency || 'UYU',
        line_items: payload.line_items || [],
        shipping_lines: payload.shipping_lines || [],
        billing: payload.billing || {},
        shipping: payload.shipping || {},
        payment_data: payload.meta_data || {},
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error inserting order into Supabase');
    }

    return {
      id: data.id,
      order_key: data.order_key,
      status: data.status,
      total: String(data.total),
      currency: data.currency,
      line_items: data.line_items,
      shipping_lines: data.shipping_lines,
      billing: data.billing,
      shipping: data.shipping,
      meta_data: data.payment_data,
    };
  } catch (e) {
    // Si la tabla no está creada aún en Supabase, retorna orden mock para no romper el checkout
    const mockId = Date.now();
    return {
      id: mockId,
      order_key: orderKey,
      status: payload.status || 'pending',
      total: String(payload.total || '0'),
      currency: payload.currency || 'UYU',
      line_items: payload.line_items || [],
      shipping_lines: payload.shipping_lines || [],
      billing: payload.billing || {},
      shipping: payload.shipping || {},
      meta_data: payload.meta_data || [],
    };
  }
}

export async function getCatalogOrder(idOrKey: string | number): Promise<WcOrder | null> {
  try {
    const supabase = await createClient();
    const isNumeric = /^\d+$/.test(String(idOrKey));
    let query = supabase.from('orders').select('*');
    if (isNumeric) {
      query = query.eq('id', Number(idOrKey));
    } else {
      query = query.eq('order_key', String(idOrKey));
    }

    const { data, error } = await query.single();
    if (error || !data) return null;

    return {
      id: data.id,
      order_key: data.order_key,
      status: data.status,
      total: String(data.total),
      currency: data.currency,
      line_items: data.line_items,
      shipping_lines: data.shipping_lines,
      billing: data.billing,
      shipping: data.shipping,
      meta_data: data.payment_data,
    };
  } catch {
    return null;
  }
}

export async function updateCatalogOrderStatus(idOrKey: string | number, status: string, paymentData?: any): Promise<boolean> {
  try {
    const supabase = await createClient();
    const isNumeric = /^\d+$/.test(String(idOrKey));
    let query = supabase.from('orders').update({
      status,
      payment_data: paymentData,
      updated_at: new Date().toISOString(),
    });

    if (isNumeric) {
      query = query.eq('id', Number(idOrKey));
    } else {
      query = query.eq('order_key', String(idOrKey));
    }

    const { error } = await query;
    return !error;
  } catch {
    return false;
  }
}
