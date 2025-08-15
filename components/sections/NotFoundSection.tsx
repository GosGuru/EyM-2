import { Metadata } from "next";
import OptimizedLink from "../ui/OptimizedLink";
import SectionReveal from "../motion/SectionReveal";
import SearchIcon from "../ui/SearchIcon";

interface NotFoundSectionProps {
  type?: "general" | "product" | "category";
  title?: string;
  description?: string;
  primaryButton?: {
    text: string;
    href: string;
  };
  secondaryButton?: {
    text: string;
    href: string;
  };
  suggestions?: Array<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    href: string;
  }>;
}

const defaultSuggestions = {
  general: [
    {
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      title: "Nueva Colección",
      subtitle: "Lo último en moda",
      href: "/tienda",
    },
    {
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      title: "Mis Favoritos",
      subtitle: "Productos guardados",
      href: "/favoritos",
    },
    {
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      title: "Categorías",
      subtitle: "Explora por tipo",
      href: "/categorias",
    },
  ],
  product: [
    {
      icon: (
        <svg
          className="w-4 h-4 text-eym-accent-orange"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      title: "Remeras",
      subtitle: "Estilos únicos",
      href: "/tienda/remeras",
    },
    {
      icon: (
        <svg
          className="w-4 h-4 text-eym-accent-orange"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      title: "Pantalones",
      subtitle: "Comodidad total",
      href: "/tienda/pantalones",
    },
  ],
  category: [
    {
      icon: (
        <svg
          className="w-4 h-4 text-eym-accent-orange"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Nueva Colección",
      subtitle: "Últimas tendencias",
      href: "/tienda/nueva-coleccion",
    },
    {
      icon: (
        <svg
          className="w-4 h-4 text-eym-accent-orange"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      title: "Ofertas",
      subtitle: "Precios especiales",
      href: "/sale",
    },
  ],
};

export default function NotFoundSection({
  type = "general",
  title,
  description,
  primaryButton,
  secondaryButton,
  suggestions,
}: NotFoundSectionProps) {
  // Configuración por defecto según el tipo
  const config = {
    general: {
      title: "Contenido no disponible",
      description:
        "Parece que este contenido no está disponible o fue eliminado.\nNo te preocupes, tenemos muchas opciones increíbles para ti.",
      primaryButton: { text: "Volver al Inicio", href: "/" },
      secondaryButton: { text: "Ver Productos", href: "/tienda" },
      sectionTitle: "Te puede interesar",
    },
    product: {
      title: "Producto no disponible",
      description:
        "Este producto ya no está disponible o fue discontinuado.\nTe mostramos productos similares que te pueden interesar.",
      primaryButton: { text: "Ver Todos los Productos", href: "/tienda" },
      secondaryButton: { text: "Volver al Inicio", href: "/" },
      sectionTitle: "Explora nuestras categorías",
    },
    category: {
      title: "Categoría no disponible",
      description:
        "Esta categoría no existe o fue reorganizada.\nExplora todas nuestras categorías disponibles.",
      primaryButton: { text: "Ver Categorías", href: "/categorias" },
      secondaryButton: { text: "Todos los Productos", href: "/tienda" },
      sectionTitle: "Categorías más populares",
    },
  };

  const currentConfig = config[type];
  const finalTitle = title || currentConfig.title;
  const finalDescription = description || currentConfig.description;
  const finalPrimaryButton = primaryButton || currentConfig.primaryButton;
  const finalSecondaryButton = secondaryButton || currentConfig.secondaryButton;
  const finalSuggestions = suggestions || defaultSuggestions[type];

  // Icono específico según el tipo
  const getIcon = () => {
    switch (type) {
      case "product":
        return (
          <svg
            className="w-12 h-12 text-eym-accent-orange"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        );
      case "category":
        return (
          <svg
            className="w-12 h-12 text-eym-accent-orange"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        );
      default:
        return (
          <SearchIcon
            size={48}
            className="text-eym-accent-orange pointer-events-none"
            showModal={true}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-eym-light flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <SectionReveal>
          <div className="mb-8">
            {/* Icono con hover effect solo para búsqueda */}
            <div
              className={`inline-flex items-center justify-center w-24 h-24 bg-eym-accent-orange/10 rounded-full mb-6 ${
                type === "general"
                  ? "cursor-pointer hover:bg-eym-accent-orange/20 hover:scale-[1.02] transition-all duration-300 ease-out"
                  : ""
              }`}
            >
              {getIcon()}
            </div>

            {/* Título principal */}
            <h1 className="text-3xl md:text-4xl font-bold text-eym-dark mb-4 font-display tracking-wide">
              {finalTitle}
            </h1>

            {/* Mensaje descriptivo */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
              {finalDescription}
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <OptimizedLink
              href={finalPrimaryButton.href}
              className="bg-eym-accent-orange hover:bg-eym-dark text-stone-800 hover:text-white
              border-2 border-stone-400 hover:border-stone-600 
              font-semibold px-8 py-4 rounded-lg transition-all duration-300 ease-out uppercase tracking-wide text-center min-w-[200px] hover:shadow-md hover:scale-[1.02] transform shadow-sm"
              prefetchOnViewport={true}
            >
              {finalPrimaryButton.text}
            </OptimizedLink>

            <OptimizedLink
              href={finalSecondaryButton.href}
              className="border-2 border-eym-dark bg-white text-eym-dark hover:bg-eym-dark hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 ease-out uppercase tracking-wide text-center min-w-[200px] hover:shadow-md hover:scale-[1.02] transform shadow-sm"
              prefetchOnViewport={true}
            >
              {finalSecondaryButton.text}
            </OptimizedLink>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          {/* Sugerencias de navegación */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-eym-dark mb-4 font-display">
              {currentConfig.sectionTitle}
            </h2>

            <div
              className={`grid grid-cols-1 ${
                finalSuggestions.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-3"
              } gap-4 text-sm`}
            >
              {finalSuggestions.map((suggestion, index) => (
                <OptimizedLink
                  key={index}
                  href={suggestion.href}
                  className="flex items-center gap-3 text-gray-600 hover:text-eym-accent-orange transition-colors p-3 rounded hover:bg-gray-50"
                  prefetchOnHover={true}
                >
                  <div className="w-8 h-8 bg-eym-accent-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {suggestion.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-xs text-gray-500">
                      {suggestion.subtitle}
                    </div>
                  </div>
                </OptimizedLink>
              ))}
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.3}>
          {/* Información adicional sutil */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              ¿Llegaste aquí desde un enlace? Es posible que haya sido movido o
              actualizado.
            </p>
          </div>
        </SectionReveal>
      </div>
    </main>
  );
}
