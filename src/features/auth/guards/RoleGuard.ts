import { useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/providers/AuthProvider';

export type GuardDenyReason = 'unauthenticated' | 'unauthorized';
export type RoleGuardStatus = 'loading' | 'allowed' | GuardDenyReason;

export interface RoleGuardMessages {
  unauthenticated?: string;
  unauthorized?: string;
}

export interface RoleGuardOptions {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  unauthorizedPath?: string;
  notify?: boolean;
  messages?: RoleGuardMessages;
}

export interface RoleGuardAuthSnapshot {
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
}

export interface RoleGuardResult {
  status: RoleGuardStatus;
  canAccess: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  reason: GuardDenyReason | null;
  redirectPath: string | null;
}

const DEFAULT_REDIRECT = '/login';
const DEFAULT_UNAUTHORIZED = '/unauthorized';
const DEFAULT_MESSAGES: Required<RoleGuardMessages> = {
  unauthenticated: 'Please sign in to continue.',
  unauthorized: 'You do not have permission to access this page.',
};

export const evaluateRoleGuard = (
  authState: RoleGuardAuthSnapshot,
  options: RoleGuardOptions = {}
): RoleGuardResult => {
  const requireAuth = options.requireAuth ?? true;
  const allowedRoles = options.allowedRoles ?? [];
  const redirectTo = options.redirectTo ?? DEFAULT_REDIRECT;
  const unauthorizedPath = options.unauthorizedPath ?? DEFAULT_UNAUTHORIZED;

  if (authState.loading) {
    return {
      status: 'loading',
      canAccess: false,
      loading: true,
      isAuthenticated: authState.isAuthenticated,
      role: authState.role,
      reason: null,
      redirectPath: null,
    };
  }

  if (requireAuth && !authState.isAuthenticated) {
    return {
      status: 'unauthenticated',
      canAccess: false,
      loading: false,
      isAuthenticated: false,
      role: authState.role,
      reason: 'unauthenticated',
      redirectPath: redirectTo,
    };
  }

  if (allowedRoles.length > 0) {
    if (!authState.role || !allowedRoles.includes(authState.role)) {
      return {
        status: 'unauthorized',
        canAccess: false,
        loading: false,
        isAuthenticated: authState.isAuthenticated,
        role: authState.role,
        reason: 'unauthorized',
        redirectPath: unauthorizedPath,
      };
    }
  }

  return {
    status: 'allowed',
    canAccess: true,
    loading: false,
    isAuthenticated: authState.isAuthenticated,
    role: authState.role,
    reason: null,
    redirectPath: null,
  };
};

function useRoleGuard(options: RoleGuardOptions = {}): RoleGuardResult {
  const auth = useAuth();
  const { toast } = useToast();
  const notify = options.notify ?? false;
  const allowedRoles = options.allowedRoles ?? [];
  const normalizedRolesKey = allowedRoles.slice().sort().join('|');
  const requireAuth = options.requireAuth ?? true;
  const redirectTo = options.redirectTo ?? DEFAULT_REDIRECT;
  const unauthorizedPath = options.unauthorizedPath ?? DEFAULT_UNAUTHORIZED;
  const unauthenticatedMessage = options.messages?.unauthenticated ?? DEFAULT_MESSAGES.unauthenticated;
  const unauthorizedMessage = options.messages?.unauthorized ?? DEFAULT_MESSAGES.unauthorized;

  const evaluation = useMemo(
    () =>
      evaluateRoleGuard(
        {
          loading: auth.loading,
          isAuthenticated: auth.isAuthenticated,
          role: auth.role,
        },
        {
          requireAuth,
          allowedRoles,
          redirectTo,
          unauthorizedPath,
        }
      ),
    [
      auth.loading,
      auth.isAuthenticated,
      auth.role,
      requireAuth,
      normalizedRolesKey,
      redirectTo,
      unauthorizedPath,
    ]
  );

  const lastReasonRef = useRef<GuardDenyReason | null>(null);

  useEffect(() => {
    if (!notify) {
      lastReasonRef.current = evaluation.reason;
      return;
    }

    if (evaluation.reason && lastReasonRef.current !== evaluation.reason) {
      lastReasonRef.current = evaluation.reason;
      const description = evaluation.reason === 'unauthenticated' ? unauthenticatedMessage : unauthorizedMessage;
      toast({
        title: 'Access restricted',
        description,
        variant: 'destructive',
      });
    }

    if (!evaluation.reason) {
      lastReasonRef.current = null;
    }
  }, [notify, evaluation.reason, toast, unauthenticatedMessage, unauthorizedMessage]);

  return evaluation;
}

function useGuard(options?: RoleGuardOptions) {
  return useRoleGuard(options);
}

export const RoleGuard = {
  useGuard,
  evaluate: evaluateRoleGuard,
  canAccess(authState: RoleGuardAuthSnapshot, options?: RoleGuardOptions) {
    return evaluateRoleGuard(authState, options).canAccess;
  },
};

export { useRoleGuard };
