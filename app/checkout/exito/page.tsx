"use client";
import { useEffect, useState } from 'react';

export default function CheckoutSuccess() {
  const [status, setStatus] = useState<'processing'|'completed'|'pending'|'on-hold'|'cancelled'|'unknown'>('pending');
  const [order, setOrder] = useState<any>(null);
  const [unverifiable, setUnverifiable] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Retrieve order_id (preferred) or external_reference, or fallback to session.
    // `key` es el secreto por pedido: sin él la API no devuelve datos.
    const orderId = params.get('order_id') || params.get('external_reference') || sessionStorage.getItem('last_order_id');
    const orderKey = params.get('key') || sessionStorage.getItem('last_order_key') || '';
    if (!orderId || !orderKey) {
      setUnverifiable(true);
      return;
    }

    let active = true;

    async function fetchStatus() {
      const res = await fetch(`/api/orders/${orderId}?key=${encodeURIComponent(orderKey)}`).then(r=>r.json());
      if (!active) return;
      if (res.ok) {
        setOrder(res.order);
        setStatus(res.order.status || 'unknown');
      } else {
        setUnverifiable(true);
      }
    }

    fetchStatus();
    const t = setInterval(fetchStatus, 3500);
    return () => { active = false; clearInterval(t); };
  }, []);

  const isProcessing = status === 'pending' || status === 'on-hold';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {unverifiable ? 'Estado del pedido' : isProcessing ? 'Procesando pago…' : '¡Gracias por tu compra!'}
      </h1>
      {isProcessing && !unverifiable && <p className="text-gray-600 mb-6">Estamos confirmando tu pago. Esta página se actualizará automáticamente.</p>}
      {unverifiable && (
        <p className="text-gray-600 mb-6">
          No pudimos verificar este pedido desde el navegador. Si ya pagaste, te va a llegar el email de confirmación;
          si el problema sigue, escribinos con el número de pedido.
        </p>
      )}
      {order && (
        <div className="rounded border p-4">
          <div className="mb-3"><strong>Pedido #</strong>{order.id}</div>
          <div className="mb-3"><strong>Estado:</strong> {order.status}</div>
          <div className="mb-2 font-semibold">Items</div>
          <ul className="list-disc pl-6 mb-3">
            {(order.line_items||[]).map((li:any, index: number)=>(
              <li key={`${li.name}-${index}`}>{li.name} x {li.quantity}</li>
            ))}
          </ul>
          <div className="flex items-center justify-between font-bold"><span>Total</span><span>{order.total} {order.currency}</span></div>
        </div>
      )}
      {!order && !unverifiable && <div className="rounded border p-4">Cargando pedido…</div>}
      <div className="mt-6"><a href="/" className="inline-flex items-center justify-center rounded-lg bg-eym-accent-orange px-6 py-3 font-semibold text-white hover:bg-eym-dark transition-colors">Volver al inicio</a></div>
    </div>
  );
}
