import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const resolveSupabaseEnv = () => {
  const env = import.meta.env;

  return {
    projectId: env.VITE_SUPABASE_PROJECT_ID || env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || '',
    url: env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey:
      env.VITE_SUPABASE_ANON_KEY ||
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      '',
  };
};

const supabaseEnv = resolveSupabaseEnv();
const missingSupabaseEnvKeys: string[] = [];

if (!supabaseEnv.url) {
  missingSupabaseEnvKeys.push('VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseEnv.anonKey) {
  missingSupabaseEnvKeys.push('VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseEnvMessage =
  missingSupabaseEnvKeys.length > 0
    ? `Missing Supabase environment variables: ${missingSupabaseEnvKeys.join(
        ', ',
      )}. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or their NEXT_PUBLIC_ equivalents.`
    : '';

let hasLoggedMissingEnv = false;

const createStubClient = (): SupabaseClient<Database> =>
  new Proxy({} as SupabaseClient<Database>, {
    get(_target, property) {
      const reason =
        supabaseEnvMessage ||
        'Supabase client is not configured. Update your environment variables to enable Supabase connectivity.';
      throw new Error(`${reason} Attempted to access "${String(property)}" on the Supabase client.`);
    },
  });

const globalScope = globalThis as typeof globalThis & {
  __SUPABASE_CLIENT__?: SupabaseClient<Database>;
};

const createSupabaseClient = (): SupabaseClient<Database> => {
  if (missingSupabaseEnvKeys.length > 0) {
    if (import.meta.env.DEV) {
      throw new Error(supabaseEnvMessage);
    }

    if (!hasLoggedMissingEnv) {
      console.warn(supabaseEnvMessage);
      hasLoggedMissingEnv = true;
    }

    return createStubClient();
  }

  return createClient<Database>(supabaseEnv.url, supabaseEnv.anonKey, {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!globalScope.__SUPABASE_CLIENT__) {
    globalScope.__SUPABASE_CLIENT__ = createSupabaseClient();
  }

  return globalScope.__SUPABASE_CLIENT__;
};

export const supabase = getSupabaseClient();

export const supabaseProjectId = supabaseEnv.projectId;
