import type { AuthAdapter, AuthResult, UserProfile } from "@/features/auth/types";
import type { Provider } from "@supabase/auth-js";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

const resolveEnv = () => {
  const env = import.meta.env;
  return {
    url:
      env.VITE_SUPABASE_URL ||
      env.NEXT_PUBLIC_SUPABASE_URL ||
      "",
    anonKey:
      env.VITE_SUPABASE_ANON_KEY ||
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      "",
  };
};

const { url: supabaseUrl, anonKey: supabaseAnonKey } = resolveEnv();

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let adapterPromise: Promise<AuthAdapter> | null = null;

const loadAdapter = async (): Promise<AuthAdapter> => {
  if (adapterPromise) {
    return adapterPromise;
  }

  if (isSupabaseConfigured) {
    adapterPromise = import("./supabaseAuthAdapter").then(({ createSupabaseAuthAdapter }) => {
      return createSupabaseAuthAdapter();
    });
    return adapterPromise;
  }

  if (import.meta.env.PROD) {
    throw new Error(
      "Supabase environment variables are missing. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before deploying."
    );
  }

  adapterPromise = import("./mockAuthAdapter").then(({ createMockAuthAdapter }) => createMockAuthAdapter());
  return adapterPromise;
};

const withAdapter = async <T>(callback: (adapter: AuthAdapter) => Promise<T>): Promise<T> => {
  const adapter = await loadAdapter();
  return callback(adapter);
};

export const authService = {
  isSupabaseConfigured,
  getSession: async (): Promise<Session | null> => {
    return withAdapter((adapter) => adapter.getSession());
  },
  onAuthStateChange: async (
    callback: (event: AuthChangeEvent, session: Session | null) => Promise<void> | void,
  ): Promise<() => void> => {
    return withAdapter((adapter) => adapter.onAuthStateChange(callback));
  },
  signInWithPassword: async (email: string, password: string): Promise<AuthResult> => {
    return withAdapter((adapter) => adapter.signInWithPassword(email, password));
  },
  signInWithOAuth: async (provider: Provider): Promise<void> => {
    return withAdapter((adapter) => adapter.signInWithOAuth(provider));
  },
  signUpWithPassword: async (email: string, password: string, fullName?: string): Promise<AuthResult> => {
    return withAdapter((adapter) => adapter.signUpWithPassword(email, password, fullName));
  },
  signOut: async (): Promise<void> => {
    return withAdapter((adapter) => adapter.signOut());
  },
  resetPassword: async (email: string): Promise<void> => {
    return withAdapter((adapter) => adapter.resetPassword(email));
  },
  acknowledgeEmailVerification: async (): Promise<void> => {
    return withAdapter((adapter) => adapter.acknowledgeEmailVerification());
  },
  fetchProfile: async (userId: string): Promise<UserProfile | null> => {
    return withAdapter((adapter) => adapter.fetchProfile(userId));
  },
};
