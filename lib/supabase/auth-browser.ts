import { createClient } from "./client";

/**
 * Inicia sesión de administrador en el navegador.
 * Devuelve { success: true } o { success: false, error }.
 */
export async function signInAdmin(email: string, password: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Cierra la sesión del administrador en el navegador.
 */
export async function signOutAdmin() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/**
 * Obtiene la sesión actual en el navegador.
 */
export async function getCurrentSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session ?? null;
}
