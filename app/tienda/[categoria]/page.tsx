import { wcFetchProducts, wcFindCategoryBySlug, wcFirstImage, type WcProduct } from "../../../lib/woocommerce";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import BotonFavorito from "../../../components/BotonFavorito";
import AddToCartButton from "../../../components/AddToCartButton";
import { SkeletonProductos } from "../../../components/skeletons/Skeleton";

export const revalidate = 300; // 5 minutos

interface Params {
  categoria: string;
}

interface ProductoUI {
  id: string | number;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria_slug?: string;
}

// Componente para cargar productos con streaming
async function ProductosContent({ categoriaSlug }: { categoriaSlug: string }) {
  const categoria = await wcFindCategoryBySlug(categoriaSlug);
  const wcProducts: WcProduct[] = categoria ? await wcFetchProducts({ category: categoria.id }) : [];
  
  const productos: ProductoUI[] = wcProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    nombre: p.name,
    descripcion: p.short_description?.replace(/<[^>]+>/g, " ") || "",
    precio: p.price ? Number.parseFloat(p.price) : 0,
    imagen_url: wcFirstImage(p) || 
      `https://picsum.photos/seed/${encodeURIComponent(p.slug)}/600/800`,
    categoria_slug: categoria?.slug,
  }));

  if (productos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">
          No hay productos disponibles en esta categoría.
        </p>
        <Link href="/tienda" className="text-eym-accent-orange hover:underline">
          Ver todas las categorías
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productos.map((prod) => (
        <Link key={prod.id} href={`/producto/${prod.slug}`} className="block group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer" role="article">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src={prod.imagen_url} alt={prod.nombre} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <BotonFavorito producto={prod} />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-eym-dark text-lg mb-2 uppercase tracking-wide">
              {prod.nombre}
            </h3>
            <p className="text-eym-dark/60 text-sm mb-3">{prod.descripcion}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xl text-eym-dark">
                ${prod.precio?.toLocaleString('es-AR')}
              </span>
              <AddToCartButton id={prod.id} name={prod.nombre} slug={prod.slug} price={prod.precio} image={prod.imagen_url} size={44} ariaLabel={`Agregar ${prod.nombre} al carrito`} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function CategoriaPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-700 mb-8">
        <Link href="/" className="hover:text-eym-accent-orange transition-colors">Inicio</Link>
        <span>›</span>
        <Link href="/tienda" className="hover:text-eym-accent-orange transition-colors">Tienda</Link>
        <span>›</span>
        <span className="text-gray-700/80 capitalize">{resolvedParams.categoria.replace(/-/g, ' ')}</span>
      </nav>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-eym-dark mb-4 uppercase tracking-wide font-display">{resolvedParams.categoria.replace(/-/g, ' ')}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Descubre nuestra colección de {resolvedParams.categoria.replace(/-/g, ' ')} con la mejor calidad y estilo.
        </p>
      </div>
      
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="relative aspect-[4/5] bg-gray-200 animate-pulse" />
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-4/5 mb-3 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                  <div className="w-11 h-11 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      }>
        <ProductosContent categoriaSlug={resolvedParams.categoria} />
      </Suspense>
    </div>
  );
} 