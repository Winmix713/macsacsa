import { ComponentType } from 'react';
import ProtectedRoute, { ProtectedRouteProps } from './ProtectedRoute';

export type WithGuardOptions = Omit<ProtectedRouteProps, 'children'>;

export function withGuard<P>(Component: ComponentType<P>, options?: WithGuardOptions) {
  const GuardedComponent = (props: P) => (
    <ProtectedRoute {...(options ?? {})}>
      <Component {...props} />
    </ProtectedRoute>
  );

  GuardedComponent.displayName = `WithGuard(${Component.displayName || Component.name || 'Component'})`;

  return GuardedComponent;
}
