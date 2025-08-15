// Mock data for when Supabase is not available
export const mockCategorias = [
  {
    slug: 'camisetas',
    nombre: 'Camisetas',
  },
  {
    slug: 'pantalones',
    nombre: 'Pantalones',
  },
  {
    slug: 'zapatos',
    nombre: 'Zapatos',
  },
  {
    slug: 'accesorios',
    nombre: 'Accesorios',
  },
];

export const mockProductos = {
  camisetas: [
    {
      id: 1,
      nombre: 'Camiseta Básica',
      precio: 25000,
      categoria_slug: 'camisetas',
      descripcion: 'Camiseta básica de algodón 100%',
      imagen_url: 'https://via.placeholder.com/400x500/E5E7EB/6B7280?text=Camiseta+B%C3%A1sica',
    },
    {
      id: 2,
      nombre: 'Camiseta Estampada',
      precio: 35000,
      categoria_slug: 'camisetas',
      descripcion: 'Camiseta con estampado moderno',
      imagen_url: 'https://via.placeholder.com/400x500/F3F4F6/6B7280?text=Camiseta+Estampada',
    },
  ],
  pantalones: [
    {
      id: 3,
      nombre: 'Jeans Clásicos',
      precio: 85000,
      categoria_slug: 'pantalones',
      descripcion: 'Jeans de corte clásico',
      imagen_url: 'https://via.placeholder.com/400x500/DBEAFE/3B82F6?text=Jeans+Cl%C3%A1sicos',
    },
  ],
  zapatos: [
    {
      id: 4,
      nombre: 'Zapatillas Deportivas',
      precio: 120000,
      categoria_slug: 'zapatos',
      descripcion: 'Zapatillas para actividad deportiva',
      imagen_url: 'https://via.placeholder.com/400x500/FEF3C7/F59E0B?text=Zapatillas',
    },
  ],
  accesorios: [
    {
      id: 5,
      nombre: 'Gorra Deportiva',
      precio: 25000,
      categoria_slug: 'accesorios',
      descripcion: 'Gorra deportiva ajustable',
      imagen_url: 'https://via.placeholder.com/400x500/FEE2E2/EF4444?text=Gorra',
    },
  ],
};
