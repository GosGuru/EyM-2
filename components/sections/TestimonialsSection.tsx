import SectionReveal from "../motion/SectionReveal";
import StaggerGrid, { StaggerItem } from "../motion/StaggerGrid";

// Datos estáticos para testimonios - podríamos hacerlo dinámico desde WP después
const testimonials = [
  { name: "Martín G.", text: "La calidad de las prendas es excelente. Definitivamente volveré a comprar." },
  { name: "Laura S.", text: "Me encanta el estilo único de EYM. Las remeras oversized son mis favoritas." },
  { name: "Diego M.", text: "Envío rápido y atención al cliente de primera. Muy recomendable." },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 px-4 bg-eym-light">
      <div className="container mx-auto">
        <SectionReveal>
          <h2 className="text-3xl font-bold mb-12 text-center font-display tracking-wide text-eym-dark">
            LO QUE DICEN NUESTROS CLIENTES
          </h2>
        </SectionReveal>
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={index}>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4" role="img" aria-label="5 estrellas">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className="w-5 h-5 text-yellow-500" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-eym-dark">{testimonial.name}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
