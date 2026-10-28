import { createClient } from "../../lib/supabase/server";
import { mockWcProducts } from "../../lib/mockData.js";
import Link from "next/link";
import AdminProductList from "./AdminProductList";
import AdminOrderList from "./AdminOrderList";
import NewProductForm from "./NewProductForm";
import { getAdminSession } from "../../lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  if (!session.success || !session.profile) {
    // Should not reach here because middleware protects, but safety fallback
    return null;
  }

  const profile = session.profile;
  if (!profile) {
    return null;
  }

  const adminName = profile.full_name || profile.email.split("@")[0];

  let products: any[] = [];
  let orders: any[] = [];
  let isConnectedToDb = false;

  try {
    const supabase = await createClient();
    const [prodsRes, ordersRes] = await Promise.all([
      supabase.from("products").select("*").order("id", { ascending: false }),
      supabase.from("orders").select("*").order("id", { ascending: false }).limit(50),
    ]);

    if (!prodsRes.error && prodsRes.data && prodsRes.data.length > 0) {
      products = prodsRes.data;
      isConnectedToDb = true;
    } else {
      products = mockWcProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        regular_price: p.regular_price,
        category_slug: p.categories?.[0]?.slug || "camisetas",
        sizes: ["S", "M", "L", "XL"],
        stock: 15,
        featured: false,
        active: true,
        images: p.images || [],
      }));
    }

    if (!ordersRes.error && ordersRes.data) {
      orders = ordersRes.data;
    }
  } catch {
    products = mockWcProducts;
  }

  const activeProducts = products.filter((p) => p.active !== false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold font-display tracking-wider text-eym-dark">
              EYM <span className="text-sm font-normal text-gray-500 font-sans">Panel Admin</span>
            </Link>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isConnectedToDb ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {isConnectedToDb ? "● Supabase Conectado" : "⚠️ Modo Demo (Ejecutar SQL en Supabase)"}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-gray-600 hover:text-eym-dark font-medium px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              Ver Tienda ↗
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{adminName}</span>
                <span className="text-sm text-red-600 hover:text-red-900 font-medium">
                  Cerrar sesión
                </span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Banner de ayuda si no hay tablas */}
        {!isConnectedToDb && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-bold text-amber-800">
                  Paso para activar tu base de datos:
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Copiá el contenido de <code className="bg-amber-100 px-1 py-0.5 rounded">docs/supabase-schema.sql</code> y pegalo en el{" "}
                  <a
                    href="https://supabase.com/dashboard/project/booloifqeoerermpbzrr/sql"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold"
                  >
                    SQL Editor de Supabase
                  </a>
                  . Apenas ejecutes el script, los productos que cargues acá se guardarán en tu base de datos en tiempo real.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos Activos</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{activeProducts.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pedidos</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Moneda de Venta</div>
            <div className="text-3xl font-bold text-eym-dark mt-2">Pesos UYU ($)</div>
          </div>
        </div>

        {/* Formulario para agregar producto */}
        <NewProductForm />

        {/* Listado de Productos */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 font-display">Catálogo de Productos ({activeProducts.length})</h2>
          </div>
          <AdminProductList products={activeProducts} />
        </section>

        {/* Listado de Pedidos */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 font-display">Pedidos Recientes ({orders.length})</h2>
          </div>
          <AdminOrderList orders={orders} />
        </section>
      </main>
    </div>
  );
}
