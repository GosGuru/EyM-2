"use client";

import { useState } from "react";
import { createProductAction } from "./actions";

export default function NewProductForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createProductAction(formData);

    setLoading(false);
    if (res.success) {
      setMsg({ type: "success", text: "¡Producto agregado con éxito al catálogo!" });
      (e.target as HTMLFormElement).reset();
      setTimeout(() => {
        setOpen(false);
        setMsg(null);
      }, 1500);
    } else {
      setMsg({ type: "error", text: res.error || "Ocurrió un error al guardar" });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-display">Carga de Productos</h2>
          <p className="text-sm text-gray-500">Agregá prendas al catálogo para que aparezcan en la tienda.</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="bg-eym-dark text-white hover:bg-eym-accent-orange font-semibold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
        >
          {open ? "Cerrar Formulario" : "+ Agregar Prenda"}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-5">
          {msg && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                msg.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de la Prenda *</label>
              <input
                name="name"
                required
                placeholder="Ej. Remera Oversize Vintage"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eym-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría *</label>
              <select
                name="category_slug"
                required
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eym-dark"
              >
                <option value="camisetas">Remeras / Camisetas</option>
                <option value="pantalones">Pantalones / Bermudas</option>
                <option value="zapatos">Calzado</option>
                <option value="accesorios">Accesorios</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio Venta (UYU) *</label>
              <input
                type="number"
                name="price"
                required
                min="1"
                placeholder="Ej. 1490"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eym-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio Tachado / Oferta (Opcional)</label>
              <input
                type="number"
                name="regular_price"
                min="1"
                placeholder="Ej. 1890"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eym-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Talles Disponibles (separados por coma)</label>
              <input
                name="sizes"
                defaultValue="S, M, L, XL"
                placeholder="S, M, L, XL"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eym-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock Disponible</label>
              <input
                type="number"
                name="stock"
                defaultValue={15}
                min="0"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eym-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">URL de la Foto</label>
            <input
              name="image_url"
              placeholder="https://... (o dejá vacío para imagen demo)"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eym-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción corta</label>
            <textarea
              name="short_description"
              rows={2}
              placeholder="Detalle rápido de la tela, calce o características..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eym-dark"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="featured" name="featured" className="rounded text-eym-dark focus:ring-eym-dark" />
            <label htmlFor="featured" className="text-sm text-gray-700 font-medium">
              Destacar en la portada principal (Home)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-eym-dark text-white hover:bg-eym-accent-orange font-semibold px-6 py-2 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
