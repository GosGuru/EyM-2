import Image from "next/image";
import { wcFetchCategories, type WcCategory } from "../../lib/woocommerce";
import { ErrorFallback } from "../ui/ErrorFallback";
import SectionReveal from "../motion/SectionReveal";
import StaggerGrid, { StaggerItem } from "../motion/StaggerGrid";
import OptimizedLink from "../ui/OptimizedLink";

// Función con cache optimizado para categorías
async function getFeaturedCategories(): Promise<WcCategory[]> {
  try {
    const categorias = await wcFetchCategories(600); // 10 minutos de cache
    // Filtrar la categoría del inicio y tomar las primeras 3
    const HOME_CATEGORY_SLUG = "destacados";
    const categoriasSinHome = categorias.filter((c) => c.slug !== HOME_CATEGORY_SLUG);
    return categoriasSinHome.slice(0, 3);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error; // Re-lanzar para que sea manejado por el error boundary
  }
}

export default async function FeaturedCategories() {
  try {
    const destacadas = await getFeaturedCategories();

    if (!destacadas.length) {
      return (
        <section className="py-16 px-4 bg-eym-light">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center font-display tracking-wide text-eym-dark">
              CATEGORÍAS DESTACADAS
            </h2>
            <div className="text-center py-8">
              <p className="text-gray-600">No hay categorías disponibles en este momento.</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="py-16 px-4 bg-eym-light">
        <div className="container mx-auto">
          <SectionReveal>
            <h2 className="text-3xl font-bold mb-12 text-center font-display tracking-wide text-eym-dark">
              CATEGORÍAS DESTACADAS
            </h2>
          </SectionReveal>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destacadas.map((cat) => {
              const image = cat.image?.src || `https://picsum.photos/seed/${encodeURIComponent(cat.slug)}/600/800`;
              return (
                <StaggerItem key={cat.slug}>
                  <OptimizedLink 
                    href={`/tienda/${cat.slug}`}
                    className="group relative overflow-hidden rounded-lg aspect-[3/4] block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange"
                    prefetchOnHover={true}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                    <Image 
                      src={image} 
                      alt={`Categoría ${cat.name}`} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="text-2xl font-bold text-white mb-2 font-display tracking-wide">
                        {cat.name}
                      </h3>
                      <span className="inline-block text-white/90 group-hover:text-eym-accent-orange transition-colors">
                        Ver productos →
                      </span>
                    </div>
                  </OptimizedLink>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>
    );
  } catch (error) {
    return (
      <ErrorFallback 
        title="Error al cargar categorías"
        message="No pudimos cargar las categorías. Por favor, recarga la página."
        className="bg-eym-light"
      />
    );
  }
}
