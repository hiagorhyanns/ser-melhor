import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Cliente Supabase compartilhado.
 *
 * `null` quando as variáveis de ambiente não estão configuradas — nesse caso
 * o app cai no fallback de localStorage (dados ficam só no navegador local).
 * Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (.env.local + Vercel) para
 * ativar a persistência na nuvem (dados/imagens globais).
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const SUPABASE_ENABLED = supabase !== null;

/** Bucket público onde as imagens enviadas pelo usuário são guardadas. */
export const IMAGES_BUCKET = 'images';

/**
 * Sobe um arquivo de imagem para o Storage e retorna a URL pública.
 * Lança erro se o Supabase não estiver configurado.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase não configurado');
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
