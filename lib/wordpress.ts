// Lightweight WordPress REST integration for headless content
// Configure your WordPress base URL in .env.local: WP_API_URL=https://your-site.com/wp-json/wp/v2

export type WpPost = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
  _embedded?: any;
};

export type WpPage = WpPost;

function getBase(): string {
  const base = process.env.WP_API_URL;
  if (!base) throw new Error("WP_API_URL is not set in .env.local");
  return base.replace(/\/$/, "");
}

async function wpFetch<T>(path: string, opts?: RequestInit & { revalidate?: number }) {
  const base = getBase();
  const url = `${base}${path}`;
  const revalidate = opts?.revalidate ?? 60;
  const res = await fetch(url, { next: { revalidate }, ...opts });
  if (!res.ok) throw new Error(`WP fetch failed ${res.status}: ${url}`);
  return (await res.json()) as T;
}

export async function fetchPosts(limit = 12): Promise<WpPost[]> {
  try {
    return await wpFetch<WpPost[]>(`/posts?_embed=1&per_page=${limit}`);
  } catch {
    // Fallback to empty list so build does not fail if WP is local-only
    return [];
  }
}

export async function fetchPostBySlug(slug: string): Promise<WpPost | null> {
  try {
    const posts = await wpFetch<WpPost[]>(`/posts?_embed=1&slug=${encodeURIComponent(slug)}`);
    return posts?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function fetchPageBySlug(slug: string): Promise<WpPage | null> {
  try {
    const pages = await wpFetch<WpPage[]>(`/pages?_embed=1&slug=${encodeURIComponent(slug)}`);
    return pages?.[0] ?? null;
  } catch {
    return null;
  }
}

export function getFeaturedImage(post: WpPost | WpPage): string | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const src = media?.source_url || media?.media_details?.sizes?.medium_large?.source_url || media?.media_details?.sizes?.full?.source_url;
  return src || null;
}
