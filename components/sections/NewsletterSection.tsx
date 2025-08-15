"use client";
import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setStatus("loading");
    
    try {
      // Simular llamada a API - aquí puedes integrar con tu servicio de newsletter
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus("success");
      setMessage("¡Gracias por suscribirte! Te enviaremos las mejores ofertas.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage("Hubo un error. Por favor, inténtalo nuevamente.");
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-eym-accent-purple to-eym-accent-orange">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl text-center bg-black/70 backdrop-blur-sm rounded-2xl p-8 sm:p-10 shadow-xl border border-white/10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-display tracking-wide text-white drop-shadow">
            SUSCRÍBETE AL NEWSLETTER
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-white/90">
            Recibe las mejores ofertas y novedades directamente en tu email
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={status === "loading"}
              className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-transparent disabled:opacity-50"
              aria-label="Email para newsletter"
            />
            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              className="bg-eym-accent-orange hover:bg-orange-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 uppercase tracking-wide shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-live="polite"
              aria-busy={status === "loading"}
            >
              {status === "loading" ? "..." : "Suscribirme"}
            </button>
          </form>
          
          {message && (
            <div 
              className={`mt-4 p-3 rounded-lg ${
                status === "success" 
                  ? "bg-green-600/20 text-green-100" 
                  : "bg-red-600/20 text-red-100"
              }`}
              role="alert"
              aria-live="polite"
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
