import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseAuthAvailable = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url');

export const supabase = isSupabaseAuthAvailable
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
