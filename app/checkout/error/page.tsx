"use client";
import { useState } from 'react';

export default function CheckoutError() {
  const [loading, setLoading] = useState(false);

  async function retry() {
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const order_id = params.get('order_id') || sessionStorage.getItem('last_order_id');
    if (!order_id) { window.location.href = '/checkout'; return; }
    const totals = { grandTotal: Number(sessionStorage.getItem('last_grand_total')||0) };
    const payer = { email: sessionStorage.getItem('last_email')||undefined };
    const res = await fetch('/api/checkout/payment', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ order_id, totals, payer }) }).then(r=>r.json());
    if (res.ok) window.location.href = res.init_point; else setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <h1 className="text-2xl font-bold mb-3">Pago rechazado o cancelado</h1>
      <p className="text-gray-600 mb-6">Tu pago no pudo completarse. Podés intentarlo nuevamente.</p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={retry} className="inline-flex items-center justify-center rounded-lg bg-eym-accent-orange px-6 py-3 font-semibold text-white hover:bg-eym-dark transition-colors">{loading?'Creando…':'Reintentar pago'}</button>
        <a href="/tienda" className="text-sm text-gray-600 hover:text-eym-dark underline">Volver a la tienda</a>
      </div>
    </div>
  );
}
