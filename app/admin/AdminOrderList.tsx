"use client";

import { useState } from "react";
import { updateOrderStatusAction } from "./actions";

export default function AdminOrderList({ orders }: { orders: any[] }) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    await updateOrderStatusAction(id, newStatus);
    setUpdatingId(null);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No hay pedidos registrados todavía. Cuando un comprador realice un pedido en la tienda, aparecerá acá automáticamente con su estado de pago.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-left">N° Pedido</th>
            <th className="px-6 py-3 text-left">Fecha</th>
            <th className="px-6 py-3 text-left">Cliente / Envío</th>
            <th className="px-6 py-3 text-left">Total</th>
            <th className="px-6 py-3 text-left">Estado</th>
            <th className="px-6 py-3 text-right">Cambiar Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((o) => {
            const customer = o.shipping || o.billing || {};
            const clientName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Cliente Web";
            const address = `${customer.address_1 || ""}, ${customer.city || ""}, ${customer.state || ""}`.replace(/^,\s*|,\s*$/g, "");
            const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString("es-UY") : "Hoy";

            return (
              <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                  #{o.id}
                  <div className="text-xs text-gray-400 font-mono font-normal">{o.order_key}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{dateStr}</td>
                <td className="px-6 py-4 text-gray-800">
                  <div className="font-semibold text-gray-900">{clientName}</div>
                  {customer.phone && <div className="text-xs text-gray-500 font-mono">{customer.phone}</div>}
                  {address && <div className="text-xs text-gray-500">{address}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-eym-dark">
                  ${Number(o.total || 0).toLocaleString("es-UY")} {o.currency || "UYU"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      o.status === "completed" || o.status === "processing"
                        ? "bg-green-100 text-green-800"
                        : o.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {o.status === "processing"
                      ? "Pagado / En Preparación"
                      : o.status === "completed"
                      ? "Entregado"
                      : o.status === "cancelled"
                      ? "Cancelado"
                      : "Pendiente de Pago"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <select
                    disabled={updatingId === o.id}
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-eym-dark cursor-pointer disabled:opacity-50"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="processing">Pagado / Preparando</option>
                    <option value="completed">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
