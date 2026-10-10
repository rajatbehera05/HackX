import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key_here'
  );
};

if (!isSupabaseConfigured()) {
  console.warn('⚠️ [Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment variables. Running in Dev Memory Store mode.');
}

// Service role client bypasses RLS on backend when necessary, or can act on behalf of user
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper to create authenticated client using user's Bearer JWT
export const createUserClient = (accessToken) => {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'placeholder-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
