import { createClient } from '@supabase/supabase-js';

// Retain environment variables or fallback values
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || localStorage.getItem('VITE_SUPABASE_URL') || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('VITE_SUPABASE_ANON_KEY') || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isSupabaseConfigured) {
  console.log("🟢 Supabase engine initialized and connected!");
} else {
  console.log("🟡 Supabase credentials not found. Operating on local offline ledger.");
}

// Function to dynamically update Supabase credentials live from UI if wanted
export function saveSupabaseCredentials(url: string, key: string) {
  if (url && key) {
    localStorage.setItem('VITE_SUPABASE_URL', url.trim());
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key.trim());
    return true;
  }
  return false;
}

export function clearSupabaseCredentials() {
  localStorage.removeItem('VITE_SUPABASE_URL');
  localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
}
