-- Tabla de categorías
create table if not exists categorias (
    id serial primary key,
    slug text unique not null,
    nombre text not null
);

-- Asegurar columnas si ya existía la tabla sin slug
alter table if exists categorias add column if not exists slug text;
do $$ begin
    if not exists (
        select 1 from pg_constraint where conname = 'categorias_slug_key'
    ) then
        alter table categorias add constraint categorias_slug_key unique (slug);
    end if;
end $$;

-- Tabla de productos
create table if not exists productos (
    id serial primary key,
    nombre text not null,
    precio numeric not null,
    descripcion text,
    imagen_url text,
    categoria_slug text references categorias(slug) on delete set null
);

-- Asegurar columnas si ya existía la tabla con FK por id
alter table if exists productos add column if not exists descripcion text;
alter table if exists productos add column if not exists imagen_url text;
alter table if exists productos add column if not exists categoria_slug text;
-- Nota: migra datos desde categoria_id si aplica
-- update productos p set categoria_slug = c.slug from categorias c where p.categoria_id = c.id and p.categoria_slug is null;

-- Usuario admin ejemplo (debes crear desde Supabase Auth UI o CLI)
-- Para proteger el panel, solo usuarios autenticados pueden acceder.
-- Script para crear las tablas en un nuevo proyecto de Supabase

-- Crear tabla de categorías
CREATE TABLE public.categorias (
    slug TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de productos
CREATE TABLE public.productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    imagen_url TEXT,
    categoria_slug TEXT REFERENCES public.categorias(slug),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso público para lectura
CREATE POLICY "allow_public_select_categorias" ON public.categorias
    FOR SELECT USING (true);

CREATE POLICY "allow_public_select_productos" ON public.productos
    FOR SELECT USING (true);

-- Insertar datos de ejemplo
INSERT INTO public.categorias (slug, nombre, descripcion) VALUES
    ('camisetas', 'Camisetas', 'Camisetas y tops'),
    ('pantalones', 'Pantalones', 'Pantalones y jeans'),
    ('zapatos', 'Zapatos', 'Calzado deportivo y casual'),
    ('accesorios', 'Accesorios', 'Complementos y accesorios');

INSERT INTO public.productos (nombre, descripcion, precio, imagen_url, categoria_slug) VALUES
    ('Camiseta Básica', 'Camiseta básica de algodón 100%', 25000, 'https://via.placeholder.com/400x500/E5E7EB/6B7280?text=Camiseta+Básica', 'camisetas'),
    ('Camiseta Estampada', 'Camiseta con estampado moderno', 35000, 'https://via.placeholder.com/400x500/F3F4F6/6B7280?text=Camiseta+Estampada', 'camisetas'),
    ('Jeans Clásicos', 'Jeans de corte clásico', 85000, 'https://via.placeholder.com/400x500/DBEAFE/3B82F6?text=Jeans+Clásicos', 'pantalones'),
    ('Zapatillas Deportivas', 'Zapatillas para actividad deportiva', 120000, 'https://via.placeholder.com/400x500/FEF3C7/F59E0B?text=Zapatillas', 'zapatos'),
    ('Gorra Deportiva', 'Gorra deportiva ajustable', 25000, 'https://via.placeholder.com/400x500/FEE2E2/EF4444?text=Gorra', 'accesorios');
