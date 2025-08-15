// Reglas de envío centralizadas
// Empezamos con: Envío fijo nacional (UYU 180) y gratis desde UYU 2000

export type ShippingInput = {
  subtotal: number;
  destination?: { city?: string; state?: string; postcode?: string };
};

export type ShippingQuote = {
  method_id: string;
  method_title: string;
  total: number; // en moneda local
  free?: boolean;
};

export function quoteShipping(input: ShippingInput): ShippingQuote {
  const flat = 180;
  const freeFrom = 2000;
  if (input.subtotal >= freeFrom) {
    return { method_id: 'flat_rate_free', method_title: 'Envío gratis', total: 0, free: true };
  }
  return { method_id: 'flat_rate', method_title: 'Envío estándar', total: flat };
}
