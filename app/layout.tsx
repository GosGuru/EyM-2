import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { FavoritosProvider } from "../components/FavoritosContext";
import { CartProvider } from "../components/CartContext";
import CartHost from "../components/CartHost";
import MotionProvider from "../components/motion/MotionProvider";
import TopLoader from "../components/ui/TopLoader";
import DemoCatalogBanner from "../components/ui/DemoCatalogBanner";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "EYM Indumentaria - Tu Estilo, Tu Identidad",
  description: "Descubre la nueva colección de EYM Indumentaria. Ropa moderna, elegante y con personalidad. Envío gratis en compras superiores a $50.000",
  keywords: "ropa, moda, indumentaria, EYM, colección, estilo, fashion",
  authors: [{ name: "EYM Indumentaria" }],
  openGraph: {
    title: "EYM Indumentaria - Tu Estilo, Tu Identidad",
    description: "Descubre la nueva colección de EYM Indumentaria",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body suppressHydrationWarning className={`${manrope.variable} font-sans bg-eym-light text-eym-dark`}>
        <MotionProvider>
          <TopLoader />
          <FavoritosProvider>
            <CartProvider>
              <DemoCatalogBanner />
              <Header />
              {children}
              <CartHost />
            </CartProvider>
          </FavoritosProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
