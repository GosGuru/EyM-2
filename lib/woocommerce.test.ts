import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { getWcMode, wcFetchProductById, wcFetchProducts } from './woocommerce';

describe('woocommerce client', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.WP_JSON_URL;
    delete process.env.WC_BASE_URL;
    delete process.env.WP_API_URL;
    delete process.env.WC_CONSUMER_KEY;
    delete process.env.WC_CONSUMER_SECRET;
  });

  afterEach(() => {
    Object.assign(process.env, originalEnv);
  });

  it('devuelve modo mock si faltan variables', () => {
    expect(getWcMode()).toBe('mock');
  });

  it('devuelve modo mock si falta la secret', () => {
    process.env.WP_JSON_URL = 'https://mi-tienda.com/wp-json';
    process.env.WC_CONSUMER_KEY = 'ck_test';
    expect(getWcMode()).toBe('mock');
  });

  it('devuelve modo live cuando las 3 variables están configuradas', () => {
    process.env.WP_JSON_URL = 'https://mi-tienda.com/wp-json';
    process.env.WC_CONSUMER_KEY = 'ck_test';
    process.env.WC_CONSUMER_SECRET = 'cs_test';
    expect(getWcMode()).toBe('live');
  });

  it('en modo mock devuelve productos mock por ID', async () => {
    const product = await wcFetchProductById(1);
    expect(product).not.toBeNull();
    expect(product?.name).toBe('Camiseta Básica');
  });

  it('en modo mock devuelve la lista de productos mock', async () => {
    const products = await wcFetchProducts({ per_page: 3 });
    expect(products.length).toBe(3);
  });
});
