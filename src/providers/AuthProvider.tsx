import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Provider as OAuthProvider } from "@supabase/auth-js";
import { authService } from "@/features/auth/services/authService";
import type { UserProfile, UserRole } from "@/features/auth/types";
import { useToast } from "@/hooks/use-toast";

export type { UserProfile, UserRole } from "@/features/auth/types";

const VERIFICATION_EMAIL_KEY = "winmix:auth:verification-email";

const getVerificationEmailFromStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage.getItem(VERIFICATION_EMAIL_KEY);
};

const persistVerificationEmail = (value: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.sessionStorage.setItem(VERIFICATION_EMAIL_KEY, value);
  } else {
    window.sessionStorage.removeItem(VERIFICATION_EMAIL_KEY);
  }
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  pendingVerificationEmail: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  acknowledgeEmailVerification: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isAnalyst: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const isMountedRef = useRef(true);
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(
    () => getVerificationEmailFromStorage(),
  );

  const updatePendingVerificationEmail = useCallback((value: string | null) => {
    if (!isMountedRef.current) return;
    setPendingVerificationEmail(value);
    persistVerificationEmail(value);
  }, []);

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  const loadProfile = useCallback(
    async (userId: string) => {
      try {
        const data = await authService.fetchProfile(userId);
        if (!isMountedRef.current) return;
        setProfile(data);
      } catch (error) {
        if (!isMountedRef.current) return;
        setProfile(null);
        toast({
          title: "Unable to load profile",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const handleSessionChange = useCallback(
    async (nextSession: Session | null) => {
      if (!isMountedRef.current) return;

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        await loadProfile(nextUser.id);
      } else {
        setProfile(null);
      }
    },
    [loadProfile],
  );

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isActive = true;

    const initialize = async () => {
      try {
        const initialSession = await authService.getSession();
        if (!isActive) return;
        await handleSessionChange(initialSession);
      } catch (error) {
        if (!isActive) return;
        toast({
          title: "Authentication unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        if (isActive && isMountedRef.current) {
          setLoading(false);
        }
      }

      unsubscribe = await authService.onAuthStateChange(async (_event, nextSession) => {
        if (!isMountedRef.current) return;
        await handleSessionChange(nextSession);
      });
    };

    void initialize();

    return () => {
      isActive = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [handleSessionChange, toast]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authService.signInWithPassword(email, password);
      await handleSessionChange(result.session);
    },
    [handleSessionChange],
  );

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    await authService.signInWithOAuth(provider);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const result = await authService.signUpWithPassword(email, password, fullName);
      updatePendingVerificationEmail(email);
      await handleSessionChange(result.session);
    },
    [handleSessionChange, updatePendingVerificationEmail],
  );

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      if (!isMountedRef.current) return;
      setUser(null);
      setSession(null);
      setProfile(null);
      updatePendingVerificationEmail(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Unable to sign out",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }, [toast, updatePendingVerificationEmail]);

  const sendPasswordReset = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  const acknowledgeEmailVerification = useCallback(async () => {
    await authService.acknowledgeEmailVerification();
    updatePendingVerificationEmail(null);
  }, [updatePendingVerificationEmail]);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    await loadProfile(user.id);
  }, [loadProfile, user]);

  const hasRole = useCallback(
    (role: UserRole) => (profile ? profile.role === role : false),
    [profile],
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => (profile ? roles.includes(profile.role) : false),
    [profile],
  );

  const isAdmin = useCallback(() => hasRole("admin"), [hasRole]);
  const isAnalyst = useCallback(() => hasRole("analyst"), [hasRole]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      loading,
      pendingVerificationEmail,
      signIn,
      signInWithOAuth,
      signUp,
      signOut,
      sendPasswordReset,
      acknowledgeEmailVerification,
      refreshProfile,
      hasRole,
      hasAnyRole,
      isAdmin,
      isAnalyst,
    }),
    [
      acknowledgeEmailVerification,
      hasAnyRole,
      hasRole,
      isAdmin,
      isAnalyst,
      loading,
      pendingVerificationEmail,
      profile,
      refreshProfile,
      session,
      signIn,
      signInWithOAuth,
      signOut,
      signUp,
      sendPasswordReset,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
