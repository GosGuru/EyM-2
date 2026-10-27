import { describe, expect, it } from 'bun:test';
import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
  it('permite solicitudes dentro del límite', () => {
    const key = `test-ip-${Date.now()}`;
    const r1 = rateLimit(key, 3, 10000);
    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit(key, 3, 10000);
    expect(r2.ok).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimit(key, 3, 10000);
    expect(r3.ok).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('bloquea solicitudes al exceder el límite y calcula retryAfter', () => {
    const key = `test-ip-blocked-${Date.now()}`;
    rateLimit(key, 2, 5000);
    rateLimit(key, 2, 5000);

    const r3 = rateLimit(key, 2, 5000);
    expect(r3.ok).toBe(false);
    expect(r3.remaining).toBe(0);
    expect(r3.retryAfterSeconds).toBeGreaterThan(0);
  });
});
