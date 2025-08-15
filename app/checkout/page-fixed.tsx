"use client";

import { useEffect, useState, Suspense } from 'react';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

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

function CheckoutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Formulario skeleton */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
              <div className="flex justify-between border-t pt-3">
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, increase, decrease, removeItem } = useCart();
  
  // Estados
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingTotal, setShippingTotal] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverItems, setServerItems] = useState<OrderItem[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

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

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const raw = Object.fromEntries(form.entries());
    
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
      
      // Focus en el primer error
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

      // Guardar datos de la orden
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
      {/* Loader superior */}
      {submitting && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-eym-accent-orange animate-pulse" />
      )}
      
      <main className="min-h-screen bg-eym-light">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-eym-dark mb-2">Finalizar compra</h1>
            <p className="text-gray-600">Completá tus datos para confirmar el pedido</p>
          </div>

          {/* Error global */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" 
                 role="alert" aria-live="assertive">
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
                  <div>
                    <label className="block text-sm font-medium text-eym-dark mb-1">Nombre</label>
                    <input
                      name="first_name"
                      placeholder="Ej: Juan"
                      autoComplete="given-name"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eym-accent-orange/50 focus:border-eym-accent-orange"
                      onBlur={(e) => {
                        const error = validateField('first_name', e.target.value);
                        setFieldErrors(prev => ({ ...prev, first_name: error || '' }));
                      }}
                    />
                    {fieldErrors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.first_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-eym-dark mb-1">Apellido</label>
                    <input
                      name="last_name"
                      placeholder="Ej: Pérez"
                      autoComplete="family-name"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eym-accent-orange/50 focus:border-eym-accent-orange"
                      onBlur={(e) => {
                        const error = validateField('last_name', e.target.value);
                        setFieldErrors(prev => ({ ...prev, last_name: error || '' }));
                      }}
                    />
                    {fieldErrors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.last_name}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-eym-dark mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Ej: juan@email.com"
                      autoComplete="email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eym-accent-orange/50 focus:border-eym-accent-orange"
                      onBlur={(e) => {
                        const error = validateField('email', e.target.value);
                        setFieldErrors(prev => ({ ...prev, email: error || '' }));
                      }}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Te enviaremos la confirmación de compra</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-eym-dark mb-1">
                      Teléfono <span className="text-gray-500">(opcional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Ej: 099 123 456"
                      autoComplete="tel"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eym-accent-orange/50 focus:border-eym-accent-orange"
                    />
                  </div>
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
                  <div>
                    <label className="block text-sm font-medium text-eym-dark mb-1">Dirección</label>
                    <input
                      name="address_1"
                      placeholder="Ej: 18 de Julio 1234"
                      autoComplete="address-line1"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eym-accent-orange/50 focus:border-eym-accent-orange"
                      onBlur={(e) => {
                        const error = validateField('address_1', e.target.value);
                        setFieldErrors(prev => ({ ...prev, address_1: error || '' }));
                      }}
                    />
                    {fieldErrors.address_1 && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.address_1}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-eym-dark mb-1">
                      Apartamento, piso, referencia <span className="text-gray-500">(opcional)</span>
                    </label>
                    <input
                      name="address_2"
                      placeholder="Ej: Apto 5B, Entre X e Y"
                      autoComplete="address-line2"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eym-accent-orange/50 focus:border-eym-accent-orange"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-eym-dark mb-1">Ciudad</label>
                      <input
                        name="city"
                        placeholder="Ej: Montevideo"
                        autoComplete="address-level2"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eym-accent-orange/50 focus:border-eym-accent-orange"
                        onBlur={(e) => {
                          const error = validateField('city', e.target.value);
                          setFieldErrors(prev => ({ ...prev, city: error || '' }));
                        }}
                      />
                      {fieldErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-eym-dark mb-1">
                        Departamento <span className="text-gray-500">(opcional)</span>
                      </label>
                      <input
                        name="state"
                        placeholder="Ej: Montevideo"
                        autoComplete="address-level1"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eym-accent-orange/50 focus:border-eym-accent-orange"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-eym-dark mb-1">
                        Código Postal <span className="text-gray-500">(opcional)</span>
                      </label>
                      <input
                        name="postcode"
                        placeholder="Ej: 11100"
                        autoComplete="postal-code"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eym-accent-orange/50 focus:border-eym-accent-orange"
                      />
                    </div>
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
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                      Al finalizar la compra, acepto los{' '}
                      <a href="/terminos" target="_blank" className="text-eym-accent-orange hover:underline">
                        Términos y Condiciones
                      </a>
                      {' '}y la{' '}
                      <a href="/privacidad" target="_blank" className="text-eym-accent-orange hover:underline">
                        Política de Privacidad
                      </a>
                    </label>
                    {fieldErrors.terms && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.terms}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      También acepto recibir comunicaciones sobre mi pedido
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Columna derecha: Resumen sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                {/* Resumen del pedido */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                      <h2 className="font-semibold text-eym-dark flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Tu pedido ({serverItems.length} {serverItems.length === 1 ? 'producto' : 'productos'})
                      </h2>
                    </div>
                    
                    <div className="p-4">
                      {isLoadingSummary ? (
                        <div className="space-y-3">
                          {Array.from({ length: 2 }, (_, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-16 h-16 bg-gray-200 rounded animate-pulse" />
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
                                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                              </div>
                              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                            </div>
                          ))}
                        </div>
                      ) : serverItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No hay productos en tu carrito</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {serverItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-16 h-16 rounded-lg object-cover border"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 border flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-eym-dark truncate">{item.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {item.price.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => decrease(item.id)}
                                  className="w-8 h-8 rounded-full border border-gray-300 hover:border-eym-accent-orange hover:bg-eym-accent-orange/10 transition-colors flex items-center justify-center"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                
                                <span className="min-w-[2ch] text-center font-medium text-eym-dark">
                                  {item.quantity}
                                </span>
                                
                                <button
                                  type="button"
                                  onClick={() => increase(item.id)}
                                  className="w-8 h-8 rounded-full border border-gray-300 hover:border-eym-accent-orange hover:bg-eym-accent-orange/10 transition-colors flex items-center justify-center"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>
                              
                              <div className="text-right min-w-[80px]">
                                <div className="font-semibold text-eym-dark">
                                  {item.lineTotal.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="text-xs text-red-600 hover:text-red-800 hover:underline mt-1"
                                >
                                  Quitar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Totales */}
                  {serverItems.length > 0 && (
                    <div className="bg-white rounded-lg border shadow-sm p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">
                            {serverItems.reduce((acc, item) => acc + item.lineTotal, 0).toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 flex items-center gap-1">
                            Envío
                            {shippingTotal === 0 && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                GRATIS
                              </span>
                            )}
                          </span>
                          <span className="font-medium">
                            {shippingTotal.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
                          </span>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-eym-dark">Total</span>
                            <span className="text-xl font-bold text-eym-dark">
                              {grandTotal.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botón de finalizar compra */}
                  <div className="space-y-4">
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
                    
                    <a
                      href="/tienda"
                      className="block w-full text-center py-3 text-eym-dark hover:text-eym-accent-orange transition-colors text-sm font-medium"
                    >
                      ← Volver a la tienda
                    </a>
                  </div>

                  {/* Información de confianza */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Pago 100% seguro con Mercado Pago</span>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Protegemos tus datos y garantizamos la seguridad de tu compra
                    </p>

                    {/* Políticas */}
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                        <span>Envío gratis en compras superiores a $2000</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>Cambios y devoluciones sin costo</span>
                      </div>
                    </div>
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
                {grandTotal.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
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
