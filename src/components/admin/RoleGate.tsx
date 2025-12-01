import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: string[]; // Pl. ['admin', 'analyst']
}

const RoleGate = ({ children, allowedRoles }: RoleGateProps) => {
  const { profile, loading } = useAuth();

  // Ha még töltődik a profil, ne dobjuk ki azonnal
  if (loading) {
    return null; // Vagy egy spinner, ha a szülő nem kezelné
  }

  // Ha nincs profil, vagy a profil szerepköre nincs az engedélyezettek között
  if (!profile || !allowedRoles.includes(profile.role)) {
    // Átirányítás a dashboardra, mivel be van lépve, csak nincs joga ide
    // Esetleg mehet a /unauthorized oldalra is
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleGate;