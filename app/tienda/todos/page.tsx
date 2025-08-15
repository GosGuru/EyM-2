import Image from "next/image";
import Link from "next/link";
import { wcFetchProducts, wcFirstImage, type WcProduct } from "../../../lib/woocommerce";

export const revalidate = 60;

export default async function TodosLosProductosPage() {
  const productos: WcProduct[] = await wcFetchProducts({ per_page: 24 });
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <nav className="flex items-center space-x-2 text-sm text-gray-700 mb-8">
        <Link href="/" className="hover:text-eym-accent-orange transition-colors">Inicio</Link>
        <span>›</span>
        <Link href="/tienda" className="hover:text-eym-accent-orange transition-colors">Tienda</Link>
        <span>›</span>
        <span className="text-gray-700/80">Todos</span>
      </nav>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-eym-dark mb-4 uppercase tracking-wide font-display">Todos los productos</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explora nuestra colección completa.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((p) => {
          const price = p.price ? Number.parseFloat(p.price) : 0;
          const imagen = wcFirstImage(p) || `https://picsum.photos/seed/${encodeURIComponent(p.slug)}/800/800`;
          return (
            <Link key={p.id} href={`/producto/${p.slug}`} className="block group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src={imagen} alt={p.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-eym-dark text-lg mb-2 uppercase tracking-wide">
                  {p.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xl text-eym-dark">
                    ${price.toLocaleString('es-AR')}
                  </span>
                  <span className="text-eym-accent-orange group-hover:text-eym-dark font-medium text-sm transition-colors">
                    Ver detalles →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
