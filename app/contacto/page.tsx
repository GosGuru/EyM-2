import Link from 'next/link';

export const metadata = {
  title: 'Contacto y Envíos — EYM Indumentaria',
  description: 'Comunicate con EYM Indumentaria. Envíos a todo Uruguay por DAC, Correo y agencias locales.',
};

export default function ContactoPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-display tracking-wide uppercase text-eym-dark mb-4">
          Contacto y Envíos
        </h1>
        <p className="text-gray-600 text-lg">
          Estamos para ayudarte con tus consultas de talles, modelos y envíos a todo Uruguay.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Canales de Atención */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold font-display uppercase text-eym-dark border-b pb-2">
            Canales de Atención
          </h2>
          <div>
            <h3 className="font-semibold text-gray-900">WhatsApp / Pedidos</h3>
            <p className="text-gray-600 text-sm mb-2">Atención rápida para consultas de talles y pedidos:</p>
            <a
              href="https://wa.me/59899000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
            >
              <span>Escribinos por WhatsApp</span>
            </a>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Horario de Respuestas</h3>
            <p className="text-gray-600 text-sm">Lunes a Sábados de 9:00 a 20:00 hs.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Instagram</h3>
            <p className="text-gray-600 text-sm">Seguinos para ver los nuevos lanzamientos y promociones.</p>
          </div>
        </div>

        {/* Políticas de Envío en Uruguay */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold font-display uppercase text-eym-dark border-b pb-2">
            Envíos en Uruguay
          </h2>
          <div>
            <h3 className="font-semibold text-gray-900">Cobertura Nacional</h3>
            <p className="text-gray-600 text-sm">
              Llegamos a los 19 departamentos a través de DAC, Mirtrans, Correo Uruguayo o UES.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Costos de Envío</h3>
            <ul className="text-gray-600 text-sm space-y-1 list-disc pl-5 mt-1">
              <li><strong>Envío Gratis:</strong> En compras a partir de $2.000 UYU.</li>
              <li><strong>Tarifa Plana Nacional:</strong> $180 UYU para compras menores.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Medios de Pago</h3>
            <p className="text-gray-600 text-sm">
              Mercado Pago Uruguay: Tarjetas de crédito (OCA, Visa, Master), débito y redes de cobranza (Abitab y RedPagos).
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-6 border-t border-gray-200">
        <Link
          href="/tienda"
          className="inline-flex items-center justify-center rounded-lg bg-eym-accent-orange px-8 py-3 font-semibold text-white hover:bg-eym-dark transition-colors shadow-md"
        >
          Explorar la Tienda
        </Link>
      </div>
    </div>
  );
}
