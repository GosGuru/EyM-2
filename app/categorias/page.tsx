import Link from "next/link";
import Image from "next/image";

export default function CategoriasPage() {
  const categorias = [
    { nombre: "Remeras", slug: "remeras", imagen: "/assets/Imagen de WhatsApp 2025-07-10 a las 18.41.31_899d76e1.jpg" },
    { nombre: "Pantalones", slug: "pantalones", imagen: "/assets/Imagen de WhatsApp 2025-07-10 a las 18.41.32_1d012f78.jpg" },
    { nombre: "Accesorios", slug: "accesorios", imagen: "/assets/Imagen de WhatsApp 2025-07-10 a las 18.41.33_4b4b2568.jpg" },
    { nombre: "Calzado", slug: "calzado", imagen: "/assets/Imagen de WhatsApp 2025-07-10 a las 18.41.34_4901aaae.jpg" },
    { nombre: "Abrigos", slug: "abrigos", imagen: "/assets/Imagen de WhatsApp 2025-07-10 a las 18.41.34_72732791.jpg" },
    { nombre: "Conjuntos", slug: "conjuntos", imagen: "/assets/Imagen de WhatsApp 2025-07-10 a las 18.41.34_f856b94d.jpg" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center font-display tracking-wide">CATEGORÍAS</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {categorias.map((categoria) => (
          <Link 
            key={categoria.slug}
            href={`/tienda/${categoria.slug}`}
            className="group relative overflow-hidden rounded-lg aspect-square block"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
            <Image 
              src={categoria.imagen} 
              alt={categoria.nombre} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <h3 className="text-2xl font-bold text-white mb-2 font-display tracking-wide">{categoria.nombre}</h3>
              <span className="inline-block text-white/90 group-hover:text-eym-accent-orange transition-colors">
                Ver productos →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}