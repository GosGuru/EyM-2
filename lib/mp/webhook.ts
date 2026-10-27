// Verificación server-side de las notificaciones de Mercado Pago (webhooks).
//
// Mercado Pago firma cada notificación con HMAC-SHA256 sobre un manifiesto fijo:
//   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
// y manda el resultado en el header `x-signature` con formato `ts=<ts>,v1=<hex>`.
// Sin esta verificación cualquiera puede postear un pago falso y marcar órdenes como pagadas.

import { createHmac, timingSafeEqual } from 'node:crypto';

export type MpSignatureInput = {
  xSignature: string | null | undefined;
  xRequestId: string | null | undefined;
  dataId: string | null | undefined;
  secret: string | null | undefined;
};

const CENT = 0.01;

export function buildManifest(params: { dataId: string; requestId: string; ts: string }): string {
  return `id:${String(params.dataId).toLowerCase()};request-id:${params.requestId};ts:${params.ts};`;
}

/** Parsea `ts=1704908010,v1=abc...` sin confiar en el formato. */
function parseSignatureHeader(header: string): { ts?: string; v1?: string } {
  const parsed: { ts?: string; v1?: string } = {};
  for (const part of header.split(',')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key === 'ts') parsed.ts = value;
    else if (key === 'v1') parsed.v1 = value;
  }
  return parsed;
}

/**
 * true solo si la firma corresponde al manifiesto firmado con el secreto del panel de MP.
 * Falla cerrado ante cualquier dato faltante o malformado.
 */
export function verifyMpSignature(input: MpSignatureInput): boolean {
  const secret = typeof input.secret === 'string' ? input.secret.trim() : '';
  const header = typeof input.xSignature === 'string' ? input.xSignature.trim() : '';
  const requestId = typeof input.xRequestId === 'string' ? input.xRequestId.trim() : '';
  const dataId = typeof input.dataId === 'string' ? input.dataId.trim() : '';

  if (!secret || !header || !requestId || !dataId) return false;

  const { ts, v1 } = parseSignatureHeader(header);
  if (!ts || !v1) return false;

  const expected = createHmac('sha256', secret)
    .update(buildManifest({ dataId: dataId.toLowerCase(), requestId, ts }))
    .digest('hex');

  const received = Buffer.from(v1.toLowerCase(), 'utf8');
  const computed = Buffer.from(expected, 'utf8');
  if (received.length !== computed.length) return false;
  return timingSafeEqual(received, computed);
}

function toAmount(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Compara el total de la orden en WooCommerce contra lo que Mercado Pago dice haber cobrado.
 * Rechaza montos no numéricos, cero o negativos.
 */
export function amountsMatch(orderTotal: unknown, paidAmount: unknown): boolean {
  const expected = toAmount(orderTotal);
  const paid = toAmount(paidAmount);
  if (expected === null || paid === null) return false;
  if (expected <= 0 || paid <= 0) return false;
  return Math.abs(expected - paid) < CENT;
}
