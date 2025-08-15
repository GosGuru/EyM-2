import Image from "next/image";
import { Suspense } from "react";
import { wcFetchCategories } from "../../lib/woocommerce";
import PageTransition from "../../components/motion/PageTransition";
import SectionReveal from "../../components/motion/SectionReveal";
import StaggerGrid, { StaggerItem } from "../../components/motion/StaggerGrid";
import OptimizedLink from "../../components/ui/OptimizedLink";
import { SkeletonTienda } from "../../components/skeletons/Skeleton";

export const revalidate = 300; // 5 minutos

interface Categoria { 
  id: number; 
  slug: string; 
  name: string; 
  image?: { src: string } | null 
}

// Componente para cargar categorías con streaming
async function CategoriasContent() {
  const categorias: Categoria[] = await wcFetchCategories();
  
  if (categorias.length === 0) {
    return (
      <SectionReveal delay={0.1}>
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">
            No hay categorías disponibles en este momento.
          </p>
          <p className="text-gray-500">
            Por favor, intenta recargar la página o contacta al administrador.
          </p>
        </div>
      </SectionReveal>
    );
  }

  return (
    <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {categorias.map((cat) => (
        <StaggerItem key={cat.slug}>
          <OptimizedLink
            href={`/tienda/${cat.slug}`}
            className="group relative overflow-hidden rounded-lg aspect-[3/4] block shadow-lg hover:shadow-xl transition-all duration-300"
            prefetchOnHover={true}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
            <Image 
              src={cat.image?.src || `https://picsum.photos/seed/${cat.slug}/400/600`}
              alt={cat.name} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <h3 className="text-2xl font-bold text-white mb-2 font-display tracking-wide uppercase">{cat.name}</h3>
              <p className="text-white/90 text-sm">Explorar colección</p>
            </div>
          </OptimizedLink>
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}

export default function TiendaPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <h1 className="text-3xl font-bold mb-6 text-center">Categorías</h1>
        </SectionReveal>
        
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-gray-200 animate-pulse">
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        }>
          <CategoriasContent />
        </Suspense>
      </div>
    </PageTransition>
  );
}
