import type { AuthAdapter, AuthResult } from "@/features/auth/types";
import type { Provider } from "@supabase/auth-js";
import { supabase } from "@/integrations/supabase/client";

const getRedirectUrl = (fallbackPath = "/dashboard") => {
  if (typeof window === "undefined") {
    return fallbackPath;
  }

  const origin = window.location.origin;
  return `${origin}${fallbackPath}`;
};

const mapResult = (result: { data: AuthResult; error: unknown }) => {
  if (result.error) {
    throw result.error;
  }

  return result.data;
};

export const createSupabaseAuthAdapter = (): AuthAdapter => {
  return {
    getSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data.session;
    },
    onAuthStateChange: async (callback) => {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });

      return () => {
        data.subscription.unsubscribe();
      };
    },
    signInWithPassword: async (email, password) => {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return mapResult(response);
    },
    signInWithOAuth: async (provider: Provider) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        throw error;
      }
    },
    signUpWithPassword: async (email, password, fullName) => {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(),
          data: {
            full_name: fullName ?? email,
          },
        },
      });

      return mapResult(response);
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    },
    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl("/login"),
      });

      if (error) {
        throw error;
      }
    },
    acknowledgeEmailVerification: async () => {
      return Promise.resolve();
    },
    fetchProfile: async (userId: string) => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, email, full_name, role, created_at, updated_at")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      return data ?? null;
    },
  };
};
