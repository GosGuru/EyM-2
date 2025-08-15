import AdminLayout from "./layout";
import Link from "next/link";

export default function AdminHome() {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Panel de administración</h2>
      <div className="flex flex-col gap-4">
        <Link href="/admin/categorias" className="bg-white p-4 rounded shadow hover:bg-gray-100 font-semibold">Gestionar Categorías</Link>
        <Link href="/admin/productos" className="bg-white p-4 rounded shadow hover:bg-gray-100 font-semibold">Gestionar Productos</Link>
      </div>
    </AdminLayout>
  );
}
