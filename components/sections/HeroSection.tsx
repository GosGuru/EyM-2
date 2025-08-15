import Image from "next/image";
import OptimizedLink from "../ui/OptimizedLink";

export default function HeroSection() {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10"></div>
      <Image 
        src="/assets/hero.jpg" 
        alt="EYM Indumentaria - Colección" 
        fill 
        sizes="100vw"
        priority
        className="object-cover object-center"
      />
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-start">
        <div className="transition-all duration-700 opacity-100 translate-y-0">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-display tracking-wider">
            TU ESTILO,<br />TU IDENTIDAD
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-md">
            Descubre la nueva colección de EYM Indumentaria. Ropa moderna, elegante y con personalidad.
          </p>
          <div className="flex flex-wrap gap-4">
            <OptimizedLink 
              href="/tienda" 
              className="bg-eym-accent-orange hover:bg-eym-dark text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 uppercase tracking-wide"
              prefetchOnViewport={true}
            >
              Ver Colección
            </OptimizedLink>
            <OptimizedLink 
              href="/novedades" 
              className="bg-white/10 border-2 border-white/70 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 uppercase tracking-wide"
              prefetchOnViewport={true}
            >
              Novedades
            </OptimizedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
