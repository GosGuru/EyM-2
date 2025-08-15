import { Suspense } from "react";
import { Metadata } from "next";

// Importar componentes de secciones
import HeroSection from "../components/sections/HeroSection";
import FeaturedCategories from "../components/sections/FeaturedCategories";
import PromoSection from "../components/sections/PromoSection";
import FeaturedProducts from "../components/sections/FeaturedProducts";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import NewsletterSection from "../components/sections/NewsletterSection";
import SiteFooter from "../components/sections/SiteFooter";

// Importar skeletons
import { SkeletonCategories, SkeletonProducts } from "../components/skeletons/Skeleton";

export const metadata: Metadata = {
  title: "EYM Indumentaria - Tu estilo, tu identidad",
  description: "Descubre la nueva colección de EYM Indumentaria. Ropa moderna, elegante y con personalidad. Envío a todo el país.",
  keywords: "ropa, indumentaria, moda, remeras, pantalones, accesorios, Argentina",
  openGraph: {
    title: "EYM Indumentaria - Tu estilo, tu identidad",
    description: "Descubre la nueva colección de EYM Indumentaria. Ropa moderna, elegante y con personalidad.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Sin suspense porque necesita ser inmediato */}
      <HeroSection />
      
      {/* Categorías Destacadas - Con streaming */}
      <Suspense fallback={<SkeletonCategories />}>
        <FeaturedCategories />
      </Suspense>

      {/* Promoción - Componente estático */}
      <PromoSection />

      {/* Productos Destacados - Con streaming */}
      <Suspense fallback={<SkeletonProducts />}>
        <FeaturedProducts />
      </Suspense>

      {/* Testimonios - Componente estático */}
      <TestimonialsSection />

      {/* Newsletter - Componente cliente */}
      <NewsletterSection />

      {/* Footer - Componente estático */}
      <SiteFooter />
    </main>
  );
}