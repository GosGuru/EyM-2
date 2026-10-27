// Rate limiting en memoria con ventana fija acotada
// Diseñado para Serverless / Edge / Node en Next.js

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitBucket>();
const MAX_KEYS = 5000;

function cleanupOldEntries(now: number): void {
  if (store.size < MAX_KEYS) return;
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Aplica rate limiting por ventana fija.
 * @param key Identificador (ej: IP + ruta)
 * @param limit Cantidad máxima de solicitudes por ventana
 * @param windowMs Duración de la ventana en milisegundos
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  cleanupOldEntries(now);

  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      ok: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: retryAfter,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    ok: true,
    remaining,
    retryAfterSeconds: retryAfter,
  };
}

export function getClientIp(req: Request): string {
  const headers = req.headers;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
