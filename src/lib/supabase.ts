import { createClient } from '@supabase/supabase-js';

// Interfaces
export interface ReferenceMaterial {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export interface CopyHistoryItem {
  id: string;
  content: string;
  created_at: string;
  metadata: any;
}

// Configuration
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Se não houver chaves reais, não retornamos nada para indicar modo offline/local
  if (!envUrl || envUrl === 'undefined' || !envKey || envKey === 'undefined' || envKey.startsWith('sb_publishable_')) {
    return null;
  }

  return { url: envUrl, key: envKey };
};

let supabaseInstance: any = null;
const config = getSupabaseConfig();

if (config) {
  try {
    supabaseInstance = createClient(config.url, config.key);
  } catch (error) {
    console.warn("Supabase failed to initialize, switching to local mode.");
  }
}

// Storage Manager to handle Local vs Supabase
export const storage = {
  async getHistory(): Promise<string[]> {
    if (supabaseInstance) {
      try {
        const { data, error } = await supabaseInstance
          .from('copy_history')
          .select('content')
          .order('created_at', { ascending: false })
          .limit(10);
        if (!error && data) return data.map((item: any) => item.content);
      } catch (e) {
        console.warn("Supabase history fetch failed, using local.");
      }
    }
    const saved = localStorage.getItem("copy_history");
    return saved ? JSON.parse(saved) : [];
  },

  async saveHistory(content: string, metadata: any) {
    // Always save to local for immediate feedback
    const history = await this.getHistory();
    const newHistory = [content, ...history].slice(0, 10);
    localStorage.setItem("copy_history", JSON.stringify(newHistory));

    if (supabaseInstance) {
      try {
        await supabaseInstance.from('copy_history').insert([{ content, metadata }]);
      } catch (e) {
        // Silent fail for background sync
      }
    }
  },

  async clearHistory() {
    localStorage.removeItem("copy_history");
    if (supabaseInstance) {
      try {
        await supabaseInstance.from('copy_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {}
    }
  },

  async getMaterials(): Promise<ReferenceMaterial[]> {
    if (supabaseInstance) {
      try {
        const { data, error } = await supabaseInstance
          .from('reference_materials')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase materials fetch failed, using local.");
      }
    }
    const saved = localStorage.getItem("reference_materials");
    return saved ? JSON.parse(saved) : [];
  },

  async addMaterial(material: Omit<ReferenceMaterial, 'id' | 'created_at'>): Promise<ReferenceMaterial> {
    const newId = Math.random().toString(36).substring(2, 9);
    const fullMaterial: ReferenceMaterial = {
      ...material,
      id: newId,
      created_at: new Date().toISOString()
    };

    const materials = await this.getMaterials();
    localStorage.setItem("reference_materials", JSON.stringify([fullMaterial, ...materials]));

    if (supabaseInstance) {
      try {
        const { data, error } = await supabaseInstance
          .from('reference_materials')
          .insert([material])
          .select();
        if (!error && data?.[0]) return data[0];
      } catch (e) {}
    }
    return fullMaterial;
  },

  async deleteMaterial(id: string) {
    const materials = await this.getMaterials();
    localStorage.setItem("reference_materials", JSON.stringify(materials.filter(m => m.id !== id)));

    if (supabaseInstance) {
      try {
        await supabaseInstance.from('reference_materials').delete().eq('id', id);
      } catch (e) {}
    }
  }
};

export { supabaseInstance as supabase };
