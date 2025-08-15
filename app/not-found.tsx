import { Metadata } from "next";
import NotFoundSection from "../components/sections/NotFoundSection";

export const metadata: Metadata = {
  title: "Contenido no disponible - EYM Indumentaria",
  description: "El contenido que buscas no está disponible. Descubre nuestra colección completa.",
};

export default function NotFound() {
  return <NotFoundSection type="general" />;
}
