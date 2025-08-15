"use client";

import { useEffect, useState, Suspense } from 'react';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import CheckoutTopLoader from '@/components/ui/CheckoutTopLoader';
import InputField from '@/components/ui/InputField';
import PhoneInput from '@/components/ui/PhoneInput';
import OrderSummary from '@/components/checkout/OrderSummary';
import CheckoutSkeleton from '@/components/skeletons/CheckoutSkeleton';
import OptimizedLink from '@/components/ui/OptimizedLink';

// Schema de validación mejorado
const CheckoutSchema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresá un email válido'),
  phone: z.string().optional(),
  address_1: z.string().min(3, 'Ingresá la dirección completa'),
  address_2: z.string().optional(),
  city: z.string().min(2, 'Ingresá la ciudad'),
  state: z.string().optional(),
  postcode: z.string().optional(),
  terms: z.literal('on', { message: 'Debés aceptar los Términos y Condiciones' }),
});

interface OrderItem {
  id: number | string;
  name: string;
  slug: string;
  image?: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutForm />
    </Suspense>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, increase, decrease, removeItem } = useCart();
  
  // Estados del formulario
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    terms: false
  });

  // Estados del pedido
  const [serverItems, setServerItems] = useState<OrderItem[]>([]);
  const [shippingTotal, setShippingTotal] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isUpdatingTotals, setIsUpdatingTotals] = useState(false);

  const hasItems = items.length > 0;

  // Cargar resumen del pedido
  useEffect(() => {
    if (!hasItems) {
      router.replace('/tienda');
      return;
    }

    loadOrderSummary();
  }, [hasItems, items, router]);

  const loadOrderSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const payload = { 
        items: items.map(i => ({ product_id: i.id, quantity: i.qty })) 
      };
      
      const res = await fetch('/api/checkout/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Cache estratégico para mejorar rendimiento
        cache: 'no-store'
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setServerItems(data.items);
        setShippingTotal(data.shipping.total);
        setGrandTotal(data.totals.grandTotal);
      } else {
        setServerItems([]);
        setError('Error al cargar el resumen del pedido');
      }
    } catch (err) {
      console.error('Error loading order summary:', err);
      setError('Error de conexión. Intentá nuevamente.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Validación en línea
  const validateField = (name: string, value: string): string | undefined => {
    try {
      CheckoutSchema.pick({ [name]: true } as any).parse({ [name]: value });
      return undefined;
    } catch (err: any) {
      return err.errors?.[0]?.message || 'Campo inválido';
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo si existía
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Actualizar totales cuando cambian las cantidades
  const handleQuantityChange = async () => {
    setIsUpdatingTotals(true);
    try {
      await loadOrderSummary();
    } finally {
      setIsUpdatingTotals(false);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const raw = Object.fromEntries(form.entries());
    
    // Validar formulario completo
    const parsed = CheckoutSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0] as string;
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      }
      setFieldErrors(errors);
      setSubmitting(false);
      
      // Hacer focus en el primer campo con error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      errorElement?.focus();
      
      return;
    }

    const customer = {
      email: String(form.get('email') || ''),
      first_name: String(form.get('first_name') || ''),
      last_name: String(form.get('last_name') || ''),
      phone: String(form.get('phone') || ''),
      shipping: {
        address_1: String(form.get('address_1') || ''),
        address_2: String(form.get('address_2') || ''),
        city: String(form.get('city') || ''),
        state: String(form.get('state') || ''),
        postcode: String(form.get('postcode') || ''),
        country: 'UY',
      }
    };

    try {
      const payloadItems = items.map(i => ({ product_id: i.id, quantity: i.qty }));
      const shippingLine = { 
        method_id: shippingTotal === 0 ? 'flat_rate_free' : 'flat_rate', 
        method_title: shippingTotal === 0 ? 'Envío gratis' : 'Envío estándar', 
        total: shippingTotal 
      };

      // Crear orden
      const orderRes = await fetch('/api/checkout/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: payloadItems, 
          shippingLine, 
          customer, 
          meta: { 
            checkout_channel: 'headless', 
            frontend_origin: 'next', 
            cart_hash: btoa(JSON.stringify(payloadItems)) 
          } 
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.ok) {
        throw new Error(orderData.error || 'No se pudo crear el pedido');
      }

      // Procesar pago
      const paymentRes = await fetch('/api/checkout/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order_id: orderData.order_id, 
          totals: { grandTotal }, 
          payer: { 
            email: customer.email, 
            name: customer.first_name, 
            surname: customer.last_name 
          } 
        })
      });

      const paymentData = await paymentRes.json();
      if (!paymentData.ok) {
        throw new Error(paymentData.error || 'No se pudo iniciar el pago');
      }

      // Guardar datos de la orden en sessionStorage
      sessionStorage.setItem('last_order_id', String(orderData.order_id));
      sessionStorage.setItem('last_grand_total', String(grandTotal));
      sessionStorage.setItem('last_email', customer.email);
      
      // Redirigir a Mercado Pago
      window.location.href = paymentData.init_point;
      
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Error al procesar el pedido. Intentá nuevamente.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutTopLoader 
        isLoading={submitting} 
        message={submitting ? "Procesando tu pedido..." : undefined} 
      />
      
      <main className="min-h-screen bg-eym-light">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-eym-dark mb-2">Finalizar compra</h1>
            <p className="text-gray-600">
              Completá tus datos para confirmar el pedido
            </p>
          </div>

          {/* Error global */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" 
                 role="alert" 
                 aria-live="assertive">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Error:</span> {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda: Formulario */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Datos de contacto */}
              <section className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold text-eym-dark mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Datos de contacto
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <InputField
                    name="first_name"
                    label="Nombre"
                    placeholder="Ej: Juan"
                    autoComplete="given-name"
                    error={fieldErrors.first_name}
                    onValidate={(value) => validateField('first_name', value)}
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                  />
                  
                  <InputField
                    name="last_name"
                    label="Apellido"
                    placeholder="Ej: Pérez"
                    autoComplete="family-name"
                    error={fieldErrors.last_name}
                    onValidate={(value) => validateField('last_name', value)}
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    type="email"
                    name="email"
                    label="Email"
                    placeholder="Ej: juan@email.com"
                    autoComplete="email"
                    error={fieldErrors.email}
                    onValidate={(value) => validateField('email', value)}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    helperText="Te enviaremos la confirmación de compra"
                    required
                  />
                  
                  <PhoneInput
                    name="phone"
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    error={fieldErrors.phone}
                  />
                </div>
              </section>

              {/* Dirección de envío */}
              <section className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold text-eym-dark mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Dirección de envío
                </h2>
                
                <div className="space-y-4">
                  <InputField
                    name="address_1"
                    label="Dirección"
                    placeholder="Ej: 18 de Julio 1234"
                    autoComplete="address-line1"
                    error={fieldErrors.address_1}
                    onValidate={(value) => validateField('address_1', value)}
                    value={formData.address_1}
                    onChange={(e) => handleInputChange('address_1', e.target.value)}
                    required
                  />
                  
                  <InputField
                    name="address_2"
                    label="Apartamento, piso, referencia"
                    placeholder="Ej: Apto 5B, Entre X e Y"
                    autoComplete="address-line2"
                    isOptional={true}
                    value={formData.address_2}
                    onChange={(e) => handleInputChange('address_2', e.target.value)}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                      name="city"
                      label="Ciudad"
                      placeholder="Ej: Montevideo"
                      autoComplete="address-level2"
                      error={fieldErrors.city}
                      onValidate={(value) => validateField('city', value)}
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                    
                    <InputField
                      name="state"
                      label="Departamento"
                      placeholder="Ej: Montevideo"
                      autoComplete="address-level1"
                      isOptional={true}
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                    
                    <InputField
                      name="postcode"
                      label="Código Postal"
                      placeholder="Ej: 11100"
                      autoComplete="postal-code"
                      isOptional={true}
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Términos y condiciones */}
              <section className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="terms"
                    id="terms"
                    required
                    className="mt-1 w-4 h-4 text-eym-accent-orange border-gray-300 rounded focus:ring-eym-accent-orange focus:ring-2"
                    aria-describedby={fieldErrors.terms ? 'terms-error' : 'terms-help'}
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                      Al finalizar la compra, acepto los{' '}
                      <OptimizedLink 
                        href="/terminos" 
                        className="text-eym-accent-orange hover:underline"
                        target="_blank"
                      >
                        Términos y Condiciones
                      </OptimizedLink>
                      {' '}y la{' '}
                      <OptimizedLink 
                        href="/privacidad" 
                        className="text-eym-accent-orange hover:underline"
                        target="_blank"
                      >
                        Política de Privacidad
                      </OptimizedLink>
                    </label>
                    {fieldErrors.terms && (
                      <p id="terms-error" className="mt-1 text-sm text-red-600">
                        {fieldErrors.terms}
                      </p>
                    )}
                    <p id="terms-help" className="mt-1 text-xs text-gray-500">
                      También acepto recibir comunicaciones sobre mi pedido
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Columna derecha: Resumen sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <OrderSummary
                  items={serverItems}
                  shippingTotal={shippingTotal}
                  grandTotal={grandTotal}
                  isLoading={isLoadingSummary}
                  onQuantityChange={handleQuantityChange}
                />
                
                {/* Botón de finalizar compra */}
                <div className="mt-6 space-y-4">
                  <button
                    type="submit"
                    disabled={submitting || !hasItems || isLoadingSummary}
                    className="w-full bg-eym-accent-orange hover:bg-eym-dark text-white font-semibold px-6 py-4 rounded-lg transition-all duration-300 ease-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] transform shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Finalizar compra</span>
                      </>
                    )}
                  </button>
                  
                  <OptimizedLink
                    href="/tienda"
                    className="block w-full text-center py-3 text-eym-dark hover:text-eym-accent-orange transition-colors text-sm font-medium"
                    prefetchOnHover={true}
                  >
                    ← Volver a la tienda
                  </OptimizedLink>
                </div>

                {/* Políticas y garantías */}
                <div className="mt-6 space-y-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Envío gratis en compras superiores a $2000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>Cambios y devoluciones sin costo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Atención al cliente</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Barra móvil sticky */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t shadow-lg z-40">
          <div className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs text-gray-600">Total a pagar</div>
              <div className="font-bold text-lg text-eym-dark">
                {isUpdatingTotals ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-eym-accent-orange border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">Calculando...</span>
                  </div>
                ) : (
                  grandTotal.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })
                )}
              </div>
            </div>
            <button
              onClick={() => (document.querySelector('form') as HTMLFormElement)?.requestSubmit()}
              disabled={submitting || !hasItems || isLoadingSummary}
              className="bg-eym-accent-orange hover:bg-eym-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Procesando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Finalizar</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Espaciado para la barra móvil */}
        <div className="lg:hidden h-20" />
      </main>
    </>
  );
}
