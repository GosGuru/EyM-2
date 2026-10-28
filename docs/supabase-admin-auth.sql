-- ==============================================================================
-- EYM Indumentaria - Extensión de Auth para Panel Admin
-- Ejecutar este script en el SQL Editor de Supabase junto con supabase-schema.sql
-- https://supabase.com/dashboard/project/booloifqeoerermpbzrr/sql
-- ==============================================================================

-- Tabla de perfiles de administrador
create table if not exists public.admin_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  role text not null default 'admin',
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en admin_profiles
alter table public.admin_profiles enable row level security;

-- Políticas de admin_profiles
create policy "Admins pueden leer perfiles activos" on public.admin_profiles
  for select using (is_active = true);

create policy "Permitir inserción de perfiles admin" on public.admin_profiles
  for insert with check (true);

create policy "Permitir actualización de perfiles admin" on public.admin_profiles
  for update using (true) with check (true);

-- Habilitar login con email/password (si no está habilitado aún)
-- Esto se configura en Supabase Dashboard > Authentication > Settings > Enable Email Auth
