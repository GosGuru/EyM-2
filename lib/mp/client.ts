// Minimal Mercado Pago server client for Checkout Pro (redirect)
// Server-only: do not import in client components

const MP_API_BASE = 'https://api.mercadopago.com';

function getToken() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN missing');
  return token;
}

export type MpPreference = {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
  external_reference?: string;
};

export async function mpCreatePreference(payload: any): Promise<MpPreference> {
  const res = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`MP create preference failed ${res.status}`);
  return res.json();
}

export async function mpGetPayment(id: string) {
  const res = await fetch(`${MP_API_BASE}/v1/payments/${id}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`MP get payment failed ${res.status}`);
  return res.json();
}

export async function mpGetMerchantOrder(id: string) {
  const res = await fetch(`${MP_API_BASE}/merchant_orders/${id}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`MP get merchant order failed ${res.status}`);
  return res.json();
}
