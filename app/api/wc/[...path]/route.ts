import { NextRequest, NextResponse } from 'next/server';

// Proxy para cachear respuestas GET a WooCommerce
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const searchParams = request.nextUrl.searchParams;
  
  try {
    // Construir URL base
    const baseUrl = process.env.WP_JSON_URL || process.env.WC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: 'WP_JSON_URL not configured' }, { status: 500 });
    }
    
    // Auth
    const key = process.env.WC_CONSUMER_KEY;
    const secret = process.env.WC_CONSUMER_SECRET;
    if (!key || !secret) {
      return NextResponse.json({ error: 'WooCommerce keys missing' }, { status: 500 });
    }
    
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const wcUrl = `${baseUrl.replace(/\/$/, '')}/wc/v3/${path}?${searchParams.toString()}`;
    
    const response = await fetch(wcUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      // Cache en el edge con stale-while-revalidate
      next: { 
        revalidate: 300, // 5 minutos
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `WooCommerce API error: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Respuesta con headers de cache
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=300',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('WC Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
