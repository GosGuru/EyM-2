"use client";

import { useState } from "react";
import Image from "next/image";
import { deleteProductAction } from "./actions";

export default function AdminProductList({ products }: { products: any[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que querés desactivar este producto del catálogo?")) return;
    setDeletingId(id);
    await deleteProductAction(id);
    setDeletingId(null);
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No hay productos activos en este momento. Hacé click en "+ Agregar Prenda" para cargar la primera.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-left">Foto</th>
            <th className="px-6 py-3 text-left">Producto</th>
            <th className="px-6 py-3 text-left">Categoría</th>
            <th className="px-6 py-3 text-left">Precio</th>
            <th className="px-6 py-3 text-left">Talles</th>
            <th className="px-6 py-3 text-left">Stock</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {products.map((p) => {
            const imgSrc =
              p.images?.[0]?.src ||
              p.images?.[0] ||
              `https://picsum.photos/seed/${p.slug || p.id}/200/200`;

            return (
              <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <Image src={imgSrc} alt={p.name} fill className="object-cover" sizes="48px" />
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">
                  {p.name}
                  {p.featured && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                      ★ Destacado
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-gray-600 capitalize">
                  {p.category_slug || p.categories?.[0]?.slug || "General"}
                </td>
                <td className="px-6 py-3 whitespace-nowrap font-bold text-eym-dark">
                  ${Number(p.price || 0).toLocaleString("es-UY")} UYU
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                  {Array.isArray(p.sizes) ? p.sizes.join(", ") : "S, M, L, XL"}
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      (p.stock ?? 10) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {p.stock ?? 10} u.
                  </span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="text-red-600 hover:text-red-900 text-xs font-medium cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === p.id ? "Eliminando..." : "Desactivar"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
