import type { ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import type { Provider } from "@supabase/auth-js";

export type UserRole = "admin" | "analyst" | "user";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
}

export type AuthChangeHandler = (event: AuthChangeEvent, session: Session | null) => void;

export interface AuthAdapter {
  getSession: () => Promise<Session | null>;
  onAuthStateChange: (callback: AuthChangeHandler) => Promise<() => void>;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signUpWithPassword: (email: string, password: string, fullName?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  acknowledgeEmailVerification: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
}

export interface AuthLayoutCopy {
  heroTitle?: string;
  heroDescription?: string;
  heroHighlights?: ReactNode;
}
