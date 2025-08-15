import { Metadata } from "next";
import NotFoundSection from "../../components/sections/NotFoundSection";

export const metadata: Metadata = {
  title: "Categoría no encontrada - EYM Indumentaria",
  description: "La categoría que buscas no está disponible. Explora todas nuestras categorías disponibles.",
};

export default function CategoryNotFound() {
  return <NotFoundSection type="category" />;
}
