import React from 'react';
import AuthGate from '@/components/AuthGate';
import RoleGate from '@/components/admin/RoleGate';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true
}) => {
  return (
    <AuthGate requireAuth={requireAuth}>
      {allowedRoles.length > 0 ? (
        <RoleGate allowedRoles={allowedRoles}>
          {children}
        </RoleGate>
      ) : (
        children
      )}
    </AuthGate>
  );
};

export default AuthGuard;