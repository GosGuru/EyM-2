"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

// Cliente Supabase centralizado

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/admin/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-eym-dark text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">Admin Panel</h1>
        <button
          className="bg-eym-accent-orange px-4 py-2 rounded"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/admin/login");
          }}
        >
          Cerrar sesión
        </button>
      </header>
      <main className="p-6 max-w-4xl mx-auto w-full">{children}</main>
    </div>
  );
}
