import { createClient } from "./server";

/**
 * Verifica si existe una sesión de admin activa.
 * Devuelve { success: true, profile } o { success: false, error }.
 */
export async function getAdminSession() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "No hay sesión activa" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id, email, role, full_name, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    return { success: false, error: "Perfil de administrador no encontrado o inactivo" };
  }

  return { success: true, user, profile };
}

/**
 * Cierra la sesión del administrador actual.
 */
export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export type AdminSession = {
  success: true;
  user: { id: string; email: string };
  profile: { id: string; email: string; role: string; full_name: string | null; is_active: boolean };
} | {
  success: false;
  error: string;
};
