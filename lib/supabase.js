import { createClient } from '@supabase/supabase-js'
import { mockCategorias, mockProductos } from './mockData.js'

// Configuración del cliente Supabase
// IMPORTANTE: Estas variables deben estar definidas en tu archivo .env.local
// NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
// NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificación de que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables de entorno de Supabase no encontradas. Asegúrate de crear un archivo .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Verificar si el proyecto existe
const SUPABASE_PROJECT_EXISTS = supabaseUrl && supabaseUrl.includes('supabase.co');
if (!SUPABASE_PROJECT_EXISTS) {
  console.warn('⚠️ Supabase project URL seems invalid. Using mock data.');
}

// Creación del cliente Supabase
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Exportación por defecto para facilitar las importaciones
export default supabase

// Obtener categorías
export async function fetchCategorias() {
  try {
    console.log('🔍 Fetching categorias from Supabase...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    const { data, error } = await supabase.from('categorias').select('*').order('nombre', { ascending: true });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Successfully fetched categorias:', data?.length || 0, 'categories');
    return data || [];
  } catch (err) {
    console.error('❌ Failed to fetch categorias:', err.message);
    console.error('Full error:', err);
    
    // Check for specific error types
    if (err.message && err.message.includes('RLS')) {
      console.warn('⚠️ Row Level Security (RLS) issue detected. Please enable RLS on the categorias table in Supabase.');
    } else if (err.message && err.message.includes('fetch failed')) {
      console.warn('⚠️ Network connectivity issue. Cannot reach Supabase server.');
    }
    
    // Use mock data as fallback
    console.log('🔄 Using mock data as fallback...');
    return mockCategorias;
  }
}

// Obtener productos por categoría
export async function fetchProductosPorCategoria(slug) {
  try {
    console.log('🔍 Fetching productos for category:', slug);
    
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria_slug', slug)
      .order('nombre', { ascending: true });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Successfully fetched productos:', data?.length || 0, 'products');
    return data || [];
  } catch (err) {
    console.error('❌ Failed to fetch productos:', err.message);
    console.error('Full error:', err);
    
    // Use mock data as fallback
    console.log('🔄 Using mock productos as fallback for category:', slug);
    return mockProductos[slug] || [];
  }
}
