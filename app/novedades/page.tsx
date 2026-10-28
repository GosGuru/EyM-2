import { wcFetchProducts } from '@/lib/woocommerce';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 60;

export const metadata = {
  title: 'Novedades y Nuevos Ingresos — EYM Indumentaria',
  description: 'Conocé las últimas prendas y diseños que acaban de llegar a EYM Indumentaria.',
};

export default async function NovedadesPage() {
  const products = await wcFetchProducts({ per_page: 12 });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-eym-accent-orange bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Nueva Colección
        </span>
        <h1 className="text-4xl font-bold font-display tracking-wide uppercase text-eym-dark mt-3 mb-2">
          Nuevos Ingresos
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Los últimos modelos agregados al catálogo. Moda contemporánea para todo Uruguay.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/producto/${p.slug}`}
            className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
              <Image
                src={p.images?.[0]?.src || `https://picsum.photos/seed/${p.slug}/400/500`}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 bg-eym-dark text-white text-xs font-bold px-2 py-0.5 rounded uppercase">
                Nuevo
              </span>
            </div>
            <div className="p-4 space-y-1">
              <h3 className="font-semibold text-gray-900 text-sm group-hover:text-eym-accent-orange transition-colors line-clamp-1">
                {p.name}
              </h3>
              <p className="font-bold text-gray-900">${Number(p.price).toLocaleString('es-UY')} UYU</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
