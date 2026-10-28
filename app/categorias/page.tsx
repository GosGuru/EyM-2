import Link from "next/link";
import Image from "next/image";
import { wcFetchCategories } from "@/lib/woocommerce";

export const revalidate = 300;

export default async function CategoriasPage() {
  const categorias = await wcFetchCategories();

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center font-display tracking-wide uppercase">Categorías</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {categorias.map((categoria) => (
          <Link
            key={categoria.slug}
            href={`/tienda/${categoria.slug}`}
            className="group relative overflow-hidden rounded-lg aspect-square block shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
            <Image
              src={categoria.image?.src || `https://picsum.photos/seed/${categoria.slug}/600/600`}
              alt={categoria.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <h3 className="text-2xl font-bold text-white mb-2 font-display tracking-wide uppercase">{categoria.name}</h3>
              <span className="inline-block text-white/90 group-hover:text-eym-accent-orange transition-colors text-sm font-medium">
                Ver colección →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
