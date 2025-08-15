import { Metadata } from "next";
import NotFoundSection from "../../components/sections/NotFoundSection";

export const metadata: Metadata = {
  title: "Producto no encontrado - EYM Indumentaria",
  description: "El producto que buscas no está disponible. Descubre productos similares en nuestra colección.",
};

export default function ProductNotFound() {
  return <NotFoundSection type="product" />;
}
