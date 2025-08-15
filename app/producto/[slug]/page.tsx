import Image from "next/image";
import Link from "next/link";
import BotonFavorito from "../../../components/BotonFavorito";
import { wcFetchProductBySlug, wcFetchProductById, wcFetchProducts, wcFirstImage, type WcProduct } from "../../../lib/woocommerce";
import { redirect, notFound } from "next/navigation";
import AddToCartButton from "../../../components/AddToCartButton";

export const revalidate = 60;
export const dynamic = "force-static";
export const dynamicParams = true; // still allow any slug but prefer static caching

interface Params { slug: string }

interface ProductoUI {
  id: string | number;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria_slug?: string;
}

export default async function ProductoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  // If slug is numeric, resolve by ID and redirect to canonical slug
  if (/^\d+$/.test(slug)) {
    const byId = await wcFetchProductById(slug);
    if (byId?.slug) {
      return redirect(`/producto/${byId.slug}`);
    }
  }
  const wcProduct: WcProduct | null = await wcFetchProductBySlug(slug);
  if (!wcProduct) {
    notFound(); // Esto triggerea nuestro not-found.tsx específico
  }

  const producto: ProductoUI = {
    id: wcProduct.id,
    slug: wcProduct.slug,
    nombre: wcProduct.name,
    descripcion: (wcProduct.description || wcProduct.short_description || "").replace(/<[^>]+>/g, " "),
    precio: wcProduct.price ? Number.parseFloat(wcProduct.price) : 0,
    imagen_url: wcFirstImage(wcProduct) || `https://picsum.photos/seed/${encodeURIComponent(wcProduct.slug)}/800/800`,
    categoria_slug: wcProduct.categories?.[0]?.slug,
  };

  // Productos relacionados (misma categoría)
  let productosRelacionados: ProductoUI[] = [];
  const cat = wcProduct.categories?.[0];
  if (cat) {
    const wcRel = await wcFetchProducts({ category: cat.id });
    productosRelacionados = wcRel
      .filter((p) => p.id !== wcProduct.id)
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        nombre: p.name,
        descripcion: p.short_description?.replace(/<[^>]+>/g, " ") || "",
        precio: p.price ? Number.parseFloat(p.price) : 0,
        imagen_url: wcFirstImage(p) || `https://picsum.photos/seed/${encodeURIComponent(p.slug)}/800/800`,
        categoria_slug: p.categories?.[0]?.slug,
      }));
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-eym-accent-orange transition-colors">Inicio</Link>
        <span>›</span>
        <Link href="/tienda" className="hover:text-eym-accent-orange transition-colors">Tienda</Link>
        {producto.categoria_slug && (
          <>
            <span>›</span>
            <Link href={`/tienda/${producto.categoria_slug}`} className="hover:text-eym-accent-orange transition-colors capitalize">
              {producto.categoria_slug}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-gray-400">{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image src={producto.imagen_url} alt={producto.nombre} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
            <BotonFavorito producto={producto} />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-eym-dark mb-2 uppercase tracking-wide">{producto.nombre}</h1>
            <p className="text-lg text-gray-600">{producto.descripcion}</p>
          </div>
          <div className="border-t border-b border-gray-200 py-6">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-eym-dark">${producto.precio.toLocaleString('es-AR')}</span>
            </div>
            <p className="text-sm text-green-600 mt-2">✓ Envío gratis a todo el país</p>
          </div>
          <div className="space-y-4">
            <div className="w-full">
              <AddToCartButton id={producto.id} name={producto.nombre} slug={producto.slug} price={producto.precio} image={producto.imagen_url} ariaLabel="Agregar al carrito" />
            </div>
            <Link href="/checkout" className="w-full inline-flex items-center justify-center border-2 border-eym-dark hover:bg-eym-dark hover:text-white text-eym-dark font-semibold py-4 px-8 rounded-lg transition-all duration-200 uppercase tracking-wide">
              Comprar ahora
            </Link>
          </div>
        </div>
      </div>

      {productosRelacionados.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosRelacionados.map((prod) => (
              <Link key={prod.id} href={`/producto/${prod.slug}`} className="block group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-square overflow-hidden">
                  <Image src={prod.imagen_url} alt={prod.nombre} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-eym-dark text-lg mb-2 uppercase tracking-wide">{prod.nombre}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl text-eym-dark">${prod.precio.toLocaleString('es-AR')}</span>
                    <AddToCartButton id={prod.id} name={prod.nombre} slug={prod.slug} price={prod.precio} image={prod.imagen_url} size={44} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
