export default function CheckoutPending() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <h1 className="text-2xl font-bold mb-3">Pago pendiente</h1>
      <p className="text-gray-600 mb-6">Estamos revisando tu pago. Te avisaremos por email cuando se confirme.</p>
      <a href="/" className="inline-flex items-center justify-center rounded-lg bg-eym-accent-orange px-6 py-3 font-semibold text-white hover:bg-eym-dark transition-colors">Volver al inicio</a>
    </div>
  );
}
