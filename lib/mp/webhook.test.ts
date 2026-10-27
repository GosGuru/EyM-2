import { describe, expect, it } from 'bun:test';
import { createHmac } from 'node:crypto';
import { amountsMatch, buildManifest, verifyMpSignature } from './webhook';

const SECRET = 'test-secret';
const REQUEST_ID = 'req-123';
const DATA_ID = '987654321';

function sign(manifest: string, secret = SECRET) {
  return createHmac('sha256', secret).update(manifest).digest('hex');
}

function headerFor(ts = '1704908010', opts: { secret?: string; dataId?: string; requestId?: string } = {}) {
  const manifest = buildManifest({
    dataId: opts.dataId ?? DATA_ID,
    requestId: opts.requestId ?? REQUEST_ID,
    ts,
  });
  return `ts=${ts},v1=${sign(manifest, opts.secret)}`;
}

describe('buildManifest', () => {
  it('arma el manifiesto con el formato documentado por Mercado Pago', () => {
    expect(buildManifest({ dataId: '2', requestId: 'abc', ts: '10' })).toBe('id:2;request-id:abc;ts:10;');
  });

  it('normaliza el data.id a minúsculas', () => {
    expect(buildManifest({ dataId: 'ABC123', requestId: 'abc', ts: '10' })).toBe('id:abc123;request-id:abc;ts:10;');
  });
});

describe('verifyMpSignature', () => {
  it('acepta una firma válida', () => {
    expect(
      verifyMpSignature({
        xSignature: headerFor(),
        xRequestId: REQUEST_ID,
        dataId: DATA_ID,
        secret: SECRET,
      })
    ).toBe(true);
  });

  it('acepta cuando MP manda el data.id en mayúsculas', () => {
    expect(
      verifyMpSignature({
        xSignature: headerFor('1704908010', { dataId: 'abc123' }),
        xRequestId: REQUEST_ID,
        dataId: 'ABC123',
        secret: SECRET,
      })
    ).toBe(true);
  });

  it('rechaza una firma adulterada', () => {
    const valid = headerFor();
    const tampered = `${valid.slice(0, -1)}${valid.endsWith('0') ? '1' : '0'}`;
    expect(
      verifyMpSignature({ xSignature: tampered, xRequestId: REQUEST_ID, dataId: DATA_ID, secret: SECRET })
    ).toBe(false);
  });

  it('rechaza si el x-request-id no coincide con el firmado', () => {
    expect(
      verifyMpSignature({
        xSignature: headerFor(),
        xRequestId: 'otro-request-id',
        dataId: DATA_ID,
        secret: SECRET,
      })
    ).toBe(false);
  });

  it('rechaza si el data.id no coincide con el firmado', () => {
    expect(
      verifyMpSignature({
        xSignature: headerFor(),
        xRequestId: REQUEST_ID,
        dataId: '111111',
        secret: SECRET,
      })
    ).toBe(false);
  });

  it('rechaza con otro secreto', () => {
    expect(
      verifyMpSignature({
        xSignature: headerFor('1704908010', { secret: 'secreto-del-atacante' }),
        xRequestId: REQUEST_ID,
        dataId: DATA_ID,
        secret: SECRET,
      })
    ).toBe(false);
  });

  it('rechaza si falta el header', () => {
    expect(verifyMpSignature({ xSignature: null, xRequestId: REQUEST_ID, dataId: DATA_ID, secret: SECRET })).toBe(
      false
    );
  });

  it('rechaza si falta el x-request-id', () => {
    expect(verifyMpSignature({ xSignature: headerFor(), xRequestId: null, dataId: DATA_ID, secret: SECRET })).toBe(
      false
    );
  });

  it('rechaza headers malformados', () => {
    for (const bad of ['', 'v1=abc', 'ts=1704908010', 'ts=,v1=', 'garbage', 'ts=1704908010,v1=']) {
      expect(verifyMpSignature({ xSignature: bad, xRequestId: REQUEST_ID, dataId: DATA_ID, secret: SECRET })).toBe(
        false
      );
    }
  });

  it('rechaza si no hay secreto configurado', () => {
    expect(verifyMpSignature({ xSignature: headerFor(), xRequestId: REQUEST_ID, dataId: DATA_ID, secret: '' })).toBe(
      false
    );
  });
});

describe('amountsMatch', () => {
  it('acepta el mismo monto', () => {
    expect(amountsMatch(12500.5, 12500.5)).toBe(true);
  });

  it('acepta el mismo monto en number y string', () => {
    expect(amountsMatch('12500.50', 12500.5)).toBe(true);
  });

  it('tolera diferencias de redondeo menores a un centavo', () => {
    expect(amountsMatch(100, 100.009)).toBe(true);
  });

  it('rechaza un monto menor (pago manipulado)', () => {
    expect(amountsMatch(120000, 1)).toBe(false);
  });

  it('rechaza un monto mayor', () => {
    expect(amountsMatch(100, 100.02)).toBe(false);
  });

  it('rechaza valores no numéricos', () => {
    for (const bad of ['abc', '', null, undefined, NaN, Infinity, {}]) {
      expect(amountsMatch(bad as never, 100)).toBe(false);
      expect(amountsMatch(100, bad as never)).toBe(false);
    }
  });

  it('rechaza montos en cero o negativos', () => {
    expect(amountsMatch(0, 0)).toBe(false);
    expect(amountsMatch(-10, -10)).toBe(false);
  });
});
