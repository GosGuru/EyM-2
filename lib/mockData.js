// Mock data for WooCommerce when not available
export const mockWcCategories = [
  {
    id: 1,
    name: 'Camisetas',
    slug: 'camisetas',
    image: { src: 'https://via.placeholder.com/300x300/E5E7EB/6B7280?text=Camisetas' }
  },
  {
    id: 2,
    name: 'Pantalones',
    slug: 'pantalones',
    image: { src: 'https://via.placeholder.com/300x300/DBEAFE/3B82F6?text=Pantalones' }
  },
  {
    id: 3,
    name: 'Zapatos',
    slug: 'zapatos',
    image: { src: 'https://via.placeholder.com/300x300/FEF3C7/F59E0B?text=Zapatos' }
  },
  {
    id: 4,
    name: 'Accesorios',
    slug: 'accesorios',
    image: { src: 'https://via.placeholder.com/300x300/FEE2E2/EF4444?text=Accesorios' }
  }
];

export const mockWcProducts = [
  {
    id: 1,
    name: 'Camiseta Básica',
    slug: 'camiseta-basica',
    price: '25000',
    regular_price: '25000',
    images: [{ src: 'https://via.placeholder.com/400x500/E5E7EB/6B7280?text=Camiseta+Básica', alt: 'Camiseta Básica' }],
    categories: [{ id: 1, name: 'Camisetas', slug: 'camisetas' }],
    short_description: 'Camiseta básica de algodón 100%'
  },
  {
    id: 2,
    name: 'Camiseta Estampada',
    slug: 'camiseta-estampada',
    price: '35000',
    regular_price: '35000',
    images: [{ src: 'https://via.placeholder.com/400x500/F3F4F6/6B7280?text=Camiseta+Estampada', alt: 'Camiseta Estampada' }],
    categories: [{ id: 1, name: 'Camisetas', slug: 'camisetas' }],
    short_description: 'Camiseta con estampado moderno'
  },
  {
    id: 3,
    name: 'Jeans Clásicos',
    slug: 'jeans-clasicos',
    price: '85000',
    regular_price: '85000',
    images: [{ src: 'https://via.placeholder.com/400x500/DBEAFE/3B82F6?text=Jeans+Clásicos', alt: 'Jeans Clásicos' }],
    categories: [{ id: 2, name: 'Pantalones', slug: 'pantalones' }],
    short_description: 'Jeans de corte clásico'
  },
  {
    id: 4,
    name: 'Zapatillas Deportivas',
    slug: 'zapatillas-deportivas',
    price: '120000',
    regular_price: '120000',
    images: [{ src: 'https://via.placeholder.com/400x500/FEF3C7/F59E0B?text=Zapatillas', alt: 'Zapatillas Deportivas' }],
    categories: [{ id: 3, name: 'Zapatos', slug: 'zapatos' }],
    short_description: 'Zapatillas para actividad deportiva'
  },
  {
    id: 5,
    name: 'Gorra Deportiva',
    slug: 'gorra-deportiva',
    price: '25000',
    regular_price: '25000',
    images: [{ src: 'https://via.placeholder.com/400x500/FEE2E2/EF4444?text=Gorra', alt: 'Gorra Deportiva' }],
    categories: [{ id: 4, name: 'Accesorios', slug: 'accesorios' }],
    short_description: 'Gorra deportiva ajustable'
  },
  {
    id: 6,
    name: 'Producto Destacado 1',
    slug: 'producto-destacado-1',
    price: '45000',
    regular_price: '50000',
    sale_price: '45000',
    images: [{ src: 'https://via.placeholder.com/400x500/F0FDF4/22C55E?text=Destacado+1', alt: 'Producto Destacado 1' }],
    categories: [{ id: 1, name: 'Camisetas', slug: 'camisetas' }],
    short_description: 'Producto destacado con descuento especial'
  },
  {
    id: 7,
    name: 'Producto Destacado 2',
    slug: 'producto-destacado-2',
    price: '75000',
    regular_price: '75000',
    images: [{ src: 'https://via.placeholder.com/400x500/FEF7FF/A855F7?text=Destacado+2', alt: 'Producto Destacado 2' }],
    categories: [{ id: 2, name: 'Pantalones', slug: 'pantalones' }],
    short_description: 'Otro producto destacado de calidad premium'
  }
];
