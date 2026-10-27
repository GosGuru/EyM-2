import { describe, expect, it } from 'bun:test';
import { fetchCatalogProducts, fetchCatalogCategories, fetchCatalogProductBySlug } from './catalog';

describe('supabase catalog adapter', () => {
  it('retorna categorias mock de respaldo si no hay tablas', async () => {
    const cats = await fetchCatalogCategories();
    expect(cats.length).toBeGreaterThan(0);
    expect(cats[0]).toHaveProperty('slug');
  });

  it('retorna productos mock de respaldo respetando filtros', async () => {
    const prods = await fetchCatalogProducts({ per_page: 2 });
    expect(prods.length).toBe(2);
    expect(prods[0]).toHaveProperty('price');
  });

  it('retorna producto por slug con fallback seguro', async () => {
    const prod = await fetchCatalogProductBySlug('camiseta-basica');
    expect(prod).not.toBeNull();
    expect(prod?.name).toBe('Camiseta Básica');
  });
});
