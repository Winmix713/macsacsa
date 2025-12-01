import { env } from '@/config/env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = env.supabase.url?.trim();
const supabaseAnonKey = env.supabase.anonKey?.trim();

const missingVars: string[] = [];

if (!supabaseUrl) {
  missingVars.push('VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  missingVars.push('VITE_SUPABASE_ANON_KEY');
}

if (missingVars.length > 0) {
  const message = `Supabase client misconfiguration: ${missingVars.join(', ')} ${
    missingVars.length === 1 ? 'is' : 'are'
  } missing. Add the variable${missingVars.length > 1 ? 's' : ''} to your .env file (see .env.example) and restart the dev server.`;

  if (env.isDev) {
    throw new Error(message);
  }

  if (!env.isTest) {
    throw new Error(message);
  }

  console.warn(`${message} Falling back to a no-op Supabase client for tests.`);
}

const createNoopClient = (): SupabaseClient<Database> =>
  new Proxy(
    {},
    {
      get() {
        throw new Error(
          'Supabase client was accessed during tests without configuration. Provide test credentials if Supabase interactions are required.'
        );
      }
    }
  ) as SupabaseClient<Database>;

export const supabase: SupabaseClient<Database> =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: typeof window !== 'undefined' ? localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true
        }
      })
    : createNoopClient();
