import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PageLoading from '@/components/ui/page-loading';
import { RoleGuard, RoleGuardOptions, RoleGuardResult } from './RoleGuard';

export interface ProtectedRouteProps extends RoleGuardOptions {
  children: ReactNode;
  fallback?: ReactNode;
  state?: Record<string, unknown>;
}

const resolveRedirectPath = (guard: RoleGuardResult, status: RoleGuardResult['status']) => {
  if (guard.redirectPath) {
    return guard.redirectPath;
  }
  if (status === 'unauthenticated') {
    return '/login';
  }
  if (status === 'unauthorized') {
    return '/unauthorized';
  }
  return '/';
};

const ProtectedRoute = ({
  children,
  fallback,
  state,
  notify,
  ...options
}: ProtectedRouteProps) => {
  const location = useLocation();
  const guard = RoleGuard.useGuard({ ...options, notify: notify ?? true });

  if (guard.status === 'loading') {
    return <>{fallback ?? <PageLoading message="Verifying access..." />}</>;
  }

  if (guard.status === 'unauthenticated' || guard.status === 'unauthorized') {
    const destination = resolveRedirectPath(guard, guard.status);
    return (
      <Navigate
        to={destination}
        replace
        state={{
          from: location.pathname + location.search,
          reason: guard.reason,
          ...state,
        }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
