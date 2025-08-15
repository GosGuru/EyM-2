"use client";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import AdminLayout from "../layout";

type Categoria = {
  id: number;
  slug: string;
  nombre: string;
};

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [editId, setEditId] = useState<number|null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategorias = async () => {
  const { data } = await supabase.from("categorias").select("id, slug, nombre").order("nombre", { ascending: true });
    setCategorias(data || []);
  };

  useEffect(() => { fetchCategorias(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  await supabase.from("categorias").insert({ nombre, slug });
  setNombre("");
  setSlug("");
    fetchCategorias();
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar categoría?")) return;
    await supabase.from("categorias").delete().eq("id", id);
    fetchCategorias();
  };

  const handleEdit = (cat: Categoria) => {
    setEditId(cat.id);
    setEditNombre(cat.nombre);
    setSlug(cat.slug);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  await supabase.from("categorias").update({ nombre: editNombre, slug }).eq("id", editId);
    setEditId(null);
    setEditNombre("");
  setSlug("");
    fetchCategorias();
    setLoading(false);
  };

  return (
    <AdminLayout>
      <h2 className="text-xl font-bold mb-4">Categorías</h2>
      <form onSubmit={editId ? handleUpdate : handleAdd} className="flex flex-wrap items-end gap-2 mb-6">
        <input
          className="border p-2 rounded w-full sm:w-auto"
          placeholder="Slug (sin espacios)"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded w-full sm:w-auto"
          placeholder="Nombre de la categoría"
          value={editId ? editNombre : nombre}
          onChange={e => editId ? setEditNombre(e.target.value) : setNombre(e.target.value)}
          required
        />
        <button className="bg-eym-accent-orange text-white px-4 py-2 rounded" disabled={loading}>
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => { setEditId(null); setEditNombre(""); }}>Cancelar</button>
        )}
      </form>
      <ul className="bg-white rounded shadow divide-y">
        {categorias.map(cat => (
          <li key={cat.id} className="flex justify-between items-center p-3">
            {editId === cat.id ? (
              <span className="text-eym-accent-orange font-semibold">Editando...</span>
            ) : (
              <span>{cat.nombre}</span>
            )}
            <div className="flex gap-2">
              <button className="text-blue-600" onClick={() => handleEdit(cat)}>Editar</button>
              <button className="text-red-600" onClick={() => handleDelete(cat.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
