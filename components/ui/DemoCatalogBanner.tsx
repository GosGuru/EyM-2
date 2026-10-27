import { getWcMode } from '@/lib/woocommerce';

export default function DemoCatalogBanner() {
  if (getWcMode() !== 'mock') {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="w-full bg-amber-100 border-b border-amber-200 text-amber-900 text-xs sm:text-sm py-2 px-4 text-center font-medium"
    >
      <span className="inline-block mr-1">⚠️</span>
      <strong>Modo demostración:</strong> todavía no hay un backend WooCommerce conectado. Los productos y precios mostrados son de prueba.
    </aside>
  );
}
