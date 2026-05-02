import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const url = (envUrl && envUrl !== 'undefined' && envUrl !== '') 
    ? envUrl 
    : 'https://oulcsebvrarfmsxljbbb.supabase.co';
  
  const key = (envKey && envKey !== 'undefined' && envKey !== '') 
    ? envKey 
    : 'sb_publishable_OuUgPjcWoBD1inGzAZE8Qg_-Uc0yQKB';

  // Ensure URL is a valid format (handle case where user might just provide the ID)
  let finalUrl = url;
  if (url && !url.startsWith('http')) {
    // If it doesn't contain a dot, it's likely just an ID
    if (!url.includes('.')) {
      finalUrl = `https://${url}.supabase.co`;
    } else {
      finalUrl = `https://${url}`;
    }
  }

  return { url: finalUrl, key };
};

let supabase: any;

try {
  const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  // Create a mock object so it doesn't crash everything
  supabase = {
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: null, error: new Error("Supabase not initialized") }),
        delete: () => ({
          neq: () => Promise.resolve({ error: new Error("Supabase not initialized") })
        })
      })
    }),
    auth: {}
  };
}

export { supabase };

/**
 * Interface para o histórico de copies no Supabase
 */
export interface CopyHistoryItem {
  id: string;
  content: string;
  created_at: string;
  metadata: any;
}
