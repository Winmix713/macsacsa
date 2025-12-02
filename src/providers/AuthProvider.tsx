import { createContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'analyst' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isAnalyst: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchProfile(data.user.id);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign in';
      toast({
        title: 'Sign in failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, [fetchProfile, toast]);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign up';
      toast({
        title: 'Sign up failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setProfile(null);

      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign out';
      toast({
        title: 'Sign out failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const role = profile?.role ?? null;
  const isAuthenticated = Boolean(user);

  const hasRole = useCallback((roleToCheck: UserRole | UserRole[]) => {
    const rolesToCheck = Array.isArray(roleToCheck) ? roleToCheck : [roleToCheck];
    return role ? rolesToCheck.includes(role) : false;
  }, [role]);

  const hasAnyRole = useCallback((roles: UserRole[]) => {
    if (!roles || roles.length === 0) {
      return true;
    }
    return roles.some((roleOption) => hasRole(roleOption));
  }, [hasRole]);

  const hasAllRoles = useCallback((roles: UserRole[]) => {
    if (!roles || roles.length === 0) {
      return true;
    }
    return roles.every((roleOption) => hasRole(roleOption));
  }, [hasRole]);

  const isAdmin = useCallback(() => role === 'admin', [role]);
  const isAnalyst = useCallback(() => role === 'analyst', [role]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    profile,
    role,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isAnalyst,
  }), [
    user,
    session,
    profile,
    role,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isAnalyst,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

