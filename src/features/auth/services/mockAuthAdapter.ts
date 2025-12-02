import type { Provider } from "@supabase/auth-js";
import type { AuthAdapter, AuthChangeHandler, AuthResult, UserProfile, UserRole } from "@/features/auth/types";
import type { Session, User } from "@supabase/supabase-js";

interface MockStoredUser {
  id: string;
  email: string;
  password: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  email_confirmed_at: string | null;
}

interface MockAuthState {
  users: MockStoredUser[];
  activeUserId: string | null;
}

const STORAGE_KEY = "winmix:mock-auth";

const createMockId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mock-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
};

const defaultState: MockAuthState = {
  users: [
    {
      id: "mock-user-1",
      email: "demo@winmix.ai",
      password: "password123",
      full_name: "WinMix Demo Analyst",
      role: "analyst",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
    },
  ],
  activeUserId: null,
};

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readState = (): MockAuthState => {
  if (!isBrowser()) {
    return { ...defaultState };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return { ...defaultState };
  }

  try {
    const parsed = JSON.parse(raw) as MockAuthState;
    return {
      users: parsed.users ?? [],
      activeUserId: parsed.activeUserId ?? null,
    };
  } catch (_error) {
    return { ...defaultState };
  }
};

const writeState = (state: MockAuthState) => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const listeners = new Set<AuthChangeHandler>();

const notify = (event: Parameters<AuthChangeHandler>[0], session: Session | null) => {
  listeners.forEach((listener) => {
    listener(event, session);
  });
};

const toSupabaseUser = (storedUser: MockStoredUser): User => {
  const timestamp = new Date().toISOString();
  const base: Partial<User> = {
    id: storedUser.id,
    app_metadata: {
      provider: "email",
      providers: ["email"],
    },
    user_metadata: {
      full_name: storedUser.full_name ?? undefined,
    },
    aud: "authenticated",
    confirmation_sent_at: storedUser.email_confirmed_at ?? undefined,
    email: storedUser.email,
    created_at: storedUser.created_at,
    confirmed_at: storedUser.email_confirmed_at ?? undefined,
    email_confirmed_at: storedUser.email_confirmed_at ?? undefined,
    last_sign_in_at: timestamp,
    role: "authenticated",
    updated_at: timestamp,
    identities: [],
    factors: [],
    is_anonymous: false,
    is_sso_user: false,
  };

  return base as User;
};

const toSession = (user: User): Session => {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: `mock-access-${user.id}`,
    refresh_token: `mock-refresh-${user.id}`,
    expires_in: 3600,
    expires_at: now + 3600,
    token_type: "bearer",
    user,
  };
};

const toProfile = (user: MockStoredUser): UserProfile => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const authenticate = (state: MockAuthState, user: MockStoredUser): { state: MockAuthState; result: AuthResult } => {
  const supabaseUser = toSupabaseUser(user);
  const session = toSession(supabaseUser);
  const nextState: MockAuthState = {
    ...state,
    activeUserId: user.id,
  };
  writeState(nextState);
  notify("SIGNED_IN", session);
  return {
    state: nextState,
    result: {
      user: supabaseUser,
      session,
    },
  };
};

const clearSession = (state: MockAuthState) => {
  const nextState: MockAuthState = {
    ...state,
    activeUserId: null,
  };
  writeState(nextState);
  notify("SIGNED_OUT", null);
  return nextState;
};

export const createMockAuthAdapter = (): AuthAdapter => {
  let state = readState();

  return {
    getSession: async () => {
      state = readState();
      const activeUser = state.users.find((user) => user.id === state.activeUserId);
      if (!activeUser) {
        return null;
      }
      return toSession(toSupabaseUser(activeUser));
    },
    onAuthStateChange: async (callback) => {
      listeners.add(callback);
      state = readState();
      const activeUser = state.users.find((user) => user.id === state.activeUserId);
      if (activeUser) {
        callback("INITIAL_SESSION", toSession(toSupabaseUser(activeUser)));
      } else {
        callback("INITIAL_SESSION", null);
      }

      return () => {
        listeners.delete(callback);
      };
    },
    signInWithPassword: async (email, password) => {
      state = readState();
      const foundUser = state.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

      if (!foundUser || foundUser.password !== password) {
        throw new Error("Invalid credentials for mock authentication. Try demo@winmix.ai / password123 or create a new mock account.");
      }

      const { state: nextState, result } = authenticate(state, foundUser);
      state = nextState;
      return result;
    },
    signInWithOAuth: async (_provider: Provider) => {
      throw new Error("OAuth sign-in is not available in the mock adapter. TODO: configure Supabase project credentials to enable social login.");
    },
    signUpWithPassword: async (email, password, fullName) => {
      state = readState();
      const existing = state.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

      if (existing) {
        throw new Error("A mock user with this email already exists. Try logging in instead.");
      }

      const timestamp = new Date().toISOString();
      const newUser: MockStoredUser = {
        id: createMockId(),
        email,
        password,
        full_name: fullName ?? null,
        role: "user",
        created_at: timestamp,
        updated_at: timestamp,
        email_confirmed_at: null,
      };

      const nextState: MockAuthState = {
        users: [...state.users, newUser],
        activeUserId: null,
      };
      state = nextState;
      writeState(nextState);
      notify("USER_UPDATED", null);

      return {
        user: toSupabaseUser(newUser),
        session: null,
      };
    },
    signOut: async () => {
      state = readState();
      state = clearSession(state);
    },
    resetPassword: async (email) => {
      state = readState();
      const exists = state.users.some((user) => user.email.toLowerCase() === email.toLowerCase());
      if (!exists) {
        // Mirror Supabase behaviour: do not leak whether the email exists.
        return;
      }
      notify("PASSWORD_RECOVERY", null);
    },
    acknowledgeEmailVerification: async () => {
      state = readState();
      if (!state.activeUserId) {
        return;
      }

      const nextUsers = state.users.map((user) => {
        if (user.id !== state.activeUserId) {
          return user;
        }
        return {
          ...user,
          email_confirmed_at: new Date().toISOString(),
        };
      });

      state = {
        ...state,
        users: nextUsers,
      };
      writeState(state);
    },
    fetchProfile: async (userId) => {
      state = readState();
      const user = state.users.find((item) => item.id === userId);
      if (!user) {
        return null;
      }
      return toProfile(user);
    },
  };
};
