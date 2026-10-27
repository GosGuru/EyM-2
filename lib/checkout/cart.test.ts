import { describe, expect, it } from 'bun:test';
import { buildCartSummary } from './cart';

describe('buildCartSummary', () => {
  it('retorna carrito vacío si el input está vacío o no es array', async () => {
    const empty1 = await buildCartSummary([]);
    expect(empty1.items).toEqual([]);
    expect(empty1.totals.grandTotal).toBe(180); // costo de envío estándar

    const empty2 = await buildCartSummary(null as never);
    expect(empty2.items).toEqual([]);
  });

  it('calcula subtotales y envío gratis cuando subtotal >= 2000', async () => {
    // producto 1 cuesta 25000 en mockData
    const res = await buildCartSummary([{ product_id: 1, quantity: 2 }]);
    expect(res.missing).toEqual([]);
    expect(res.items.length).toBe(1);
    expect(res.items[0].lineTotal).toBe(50000);
    expect(res.totals.items).toBe(50000);
    expect(res.shipping.free).toBe(true);
    expect(res.totals.grandTotal).toBe(50000);
  });

  it('fusiona ítems con el mismo product_id sumando cantidades', async () => {
    const res = await buildCartSummary([
      { product_id: 1, quantity: 2 },
      { product_id: 1, quantity: 3 },
    ]);
    expect(res.items.length).toBe(1);
    expect(res.items[0].quantity).toBe(5);
  });

  it('reporta product_id inválido en missing', async () => {
    const res = await buildCartSummary([
      { product_id: 'abc', quantity: 1 },
      { product_id: -5, quantity: 1 },
    ]);
    expect(res.items).toEqual([]);
    expect(res.missing.length).toBe(2);
    expect(res.missing[0].reason).toBe('invalid_id');
  });

  it('reporta producto no encontrado en missing', async () => {
    const res = await buildCartSummary([{ product_id: 99999, quantity: 1 }]);
    expect(res.items).toEqual([]);
    expect(res.missing.length).toBe(1);
    expect(res.missing[0].reason).toBe('not_found');
  });
});
