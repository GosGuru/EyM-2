"use client";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import AdminLayout from "../layout";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen_url?: string;
  categoria_slug: string | null;
};
type Categoria = { id: number; slug: string; nombre: string };

export default function ProductosAdmin() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState({ nombre: "", precio: "", categoria_slug: "", descripcion: "", imagen_url: "" });
  const [editId, setEditId] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
  const { data: productos } = await supabase.from("productos").select("id, nombre, precio, descripcion, imagen_url, categoria_slug");
  const { data: categorias } = await supabase.from("categorias").select("id, slug, nombre").order("nombre", { ascending: true });
    setProductos(productos || []);
    setCategorias(categorias || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("productos").insert({
      nombre: form.nombre,
      precio: Number(form.precio),
      descripcion: form.descripcion || null,
      imagen_url: form.imagen_url || null,
      categoria_slug: form.categoria_slug || null
    });
    setForm({ nombre: "", precio: "", categoria_slug: "", descripcion: "", imagen_url: "" });
    fetchAll();
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar producto?")) return;
    await supabase.from("productos").delete().eq("id", id);
    fetchAll();
  };

  const handleEdit = (prod: Producto) => {
    setEditId(prod.id);
  setForm({ nombre: prod.nombre, precio: String(prod.precio), categoria_slug: String(prod.categoria_slug ?? ""), descripcion: prod.descripcion ?? "", imagen_url: prod.imagen_url ?? "" });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("productos").update({
      nombre: form.nombre,
      precio: Number(form.precio),
      descripcion: form.descripcion || null,
      imagen_url: form.imagen_url || null,
      categoria_slug: form.categoria_slug || null
    }).eq("id", editId);
    setEditId(null);
    setForm({ nombre: "", precio: "", categoria_slug: "", descripcion: "", imagen_url: "" });
    fetchAll();
    setLoading(false);
  };

  return (
    <AdminLayout>
      <h2 className="text-xl font-bold mb-4">Productos</h2>
      <form onSubmit={editId ? handleUpdate : handleAdd} className="flex flex-wrap gap-2 mb-6 items-end">
        <input
          className="border p-2 rounded w-full sm:w-auto"
          placeholder="Nombre"
          value={form.nombre}
          onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
          required
        />
        <input
          className="border p-2 rounded w-full sm:w-auto"
          placeholder="Precio"
          type="number"
          min="0"
          value={form.precio}
          onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
          required
        />
        <input
          className="border p-2 rounded w-full sm:w-auto"
          placeholder="Imagen URL (opcional)"
          value={form.imagen_url}
          onChange={e => setForm(f => ({ ...f, imagen_url: e.target.value }))}
        />
        <input
          className="border p-2 rounded w-full sm:w-auto"
          placeholder="Descripción (opcional)"
          value={form.descripcion}
          onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
        />
        <select
          className="border p-2 rounded w-full sm:w-auto"
          value={form.categoria_slug}
          onChange={e => setForm(f => ({ ...f, categoria_slug: e.target.value }))}
          required
        >
          <option value="">Categoría (slug)</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.slug}>{cat.nombre}</option>
          ))}
        </select>
        <button className="bg-eym-accent-orange text-white px-4 py-2 rounded" disabled={loading}>
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => { setEditId(null); setForm({ nombre: "", precio: "", categoria_slug: "", descripcion: "", imagen_url: "" }); }}>Cancelar</button>
        )}
      </form>
      <ul className="bg-white rounded shadow divide-y">
        {productos.map(prod => (
          <li key={prod.id} className="flex justify-between items-center p-3">
            <span>{prod.nombre} - ${prod.precio} <span className="text-xs text-gray-500">({categorias.find(c => c.slug === prod.categoria_slug)?.nombre || 'Sin categoría'})</span></span>
            <div className="flex gap-2">
              <button className="text-blue-600" onClick={() => handleEdit(prod)}>Editar</button>
              <button className="text-red-600" onClick={() => handleDelete(prod.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
