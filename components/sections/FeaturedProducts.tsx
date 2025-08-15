import Image from "next/image";
import { wcFetchCategories, wcFetchProducts, wcFirstImage, type WcProduct } from "../../lib/woocommerce";
import AddToCartButton from "../AddToCartButton";
import { ErrorFallback } from "../ui/ErrorFallback";
import SectionReveal from "../motion/SectionReveal";
import StaggerGrid, { StaggerItem } from "../motion/StaggerGrid";
import OptimizedLink from "../ui/OptimizedLink";

// Función optimizada para obtener productos destacados con cache
async function getFeaturedProducts(): Promise<WcProduct[]> {
  try {
    // Parallelizar las llamadas para mejor rendimiento
    const [categorias, featuredProducts] = await Promise.all([
      wcFetchCategories(600), // 10 minutos de cache
      wcFetchProducts({ featured: true, per_page: 8, revalidate: 300 }) // 5 minutos de cache
    ]);
    
    // Intentar primero por categoría "destacados"
    const DESTACADOS_SLUGS = ["destacados", "destacado"];
    const destacadosCat = categorias.find(c => DESTACADOS_SLUGS.includes(c.slug));
    
    if (destacadosCat) {
      const categoryProducts = await wcFetchProducts({ 
        category: destacadosCat.id, 
        per_page: 8,
        revalidate: 300
      });
      
      if (categoryProducts.length > 0) {
        return categoryProducts;
      }
    }
    
    // Fallback a productos featured
    return featuredProducts;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error; // Re-lanzar para que sea manejado por el error boundary
  }
}

export default async function FeaturedProducts() {
  try {
    const destacadosGrid = await getFeaturedProducts();

    if (!destacadosGrid.length) {
      return (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center font-display tracking-wide text-eym-dark">
              PRODUCTOS DESTACADOS
            </h2>
            <div className="text-center py-8">
              <p className="text-gray-600">No hay productos destacados disponibles en este momento.</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <SectionReveal>
            <h2 className="text-3xl font-bold mb-12 text-center font-display tracking-wide text-eym-dark">
              PRODUCTOS DESTACADOS
            </h2>
          </SectionReveal>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {destacadosGrid.map((p) => (
              <StaggerItem key={p.id}>
                <OptimizedLink 
                  href={`/producto/${p.slug}`} 
                  className="block bg-eym-light rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange"
                  prefetchOnHover={true}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image 
                      src={wcFirstImage(p) || `https://picsum.photos/seed/${encodeURIComponent(p.slug)}/800/800`} 
                      alt={`Producto ${p.name}`} 
                      fill 
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-eym-dark text-lg mb-2">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xl text-eym-dark">
                        ${Number.parseFloat(p.price || '0').toLocaleString('es-AR')}
                      </span>
                      <AddToCartButton 
                        id={p.id} 
                        name={p.name} 
                        slug={p.slug} 
                        price={Number.parseFloat(p.price || '0')} 
                        image={wcFirstImage(p)} 
                        size={44}
                      />
                    </div>
                  </div>
                </OptimizedLink>
              </StaggerItem>
            ))}
          </StaggerGrid>
          <SectionReveal delay={0.2}>
            <div className="text-center mt-12">
              <OptimizedLink 
                href="/tienda" 
                className="border-2 border-eym-dark text-eym-dark font-semibold px-8 py-3 rounded-lg transition-all duration-200 uppercase tracking-wide inline-block bg-white hover:bg-eym-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange"
                prefetchOnHover={true}
              >
                Ver Todos los Productos
              </OptimizedLink>
            </div>
          </SectionReveal>
        </div>
      </section>
    );
  } catch (error) {
    return (
      <ErrorFallback 
        title="Error al cargar productos"
        message="No pudimos cargar los productos destacados. Por favor, recarga la página."
        className="bg-white"
      />
    );
  }
}
