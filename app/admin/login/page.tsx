"use client";

import { useState } from "react";
import { signInAdmin } from "../../../lib/supabase/auth-browser";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signInAdmin(email, password);
      if (!res.success) {
        setError(res.error || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo") || "/admin";
      router.replace(redirectTo);
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-display mb-2">
            Iniciar sesión - Panel Admin
          </h2>
          <p className="text-gray-600">
            Acceso exclusivo para el equipo de EYM Indumentaria
          </p>
        </div>

        <div className="bg-white px-8 py-6 shadow rounded-lg sm:p-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eym-dark focus:outline-none text-sm"
                placeholder="enzo@eym.com.uy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eym-dark focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-eym-dark hover:bg-eym-accent-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eym-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "Ingresar al Panel"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            ¿No tenés cuenta? Contactá al administrador del sistema.
          </div>
        </div>
      </div>
    </div>
  );
}
