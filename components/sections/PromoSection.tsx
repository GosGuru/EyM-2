import Link from "next/link";

export default function PromoSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-eym-accent-purple to-eym-accent-orange">
      <div className="container mx-auto">
        <div className="mx-auto max-w-3xl text-center bg-black/70 backdrop-blur-sm rounded-2xl p-8 sm:p-10 shadow-xl border border-white/10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-display tracking-wide text-white drop-shadow">
            30% DE DESCUENTO EN TODA LA TIENDA
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-white/90">
            Usa el código <span className="font-extrabold underline decoration-white/60">EYM30</span> al finalizar tu compra
          </p>
          <Link 
            href="/tienda" 
            className="inline-block bg-eym-accent-orange hover:bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 uppercase tracking-wide shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Comprar ahora con descuento"
          >
            Comprar Ahora
          </Link>
        </div>
      </div>
    </section>
  );
}
