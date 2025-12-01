import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageLoading from '@/components/ui/page-loading'; // Az egységes töltőképernyő

interface AuthGateProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const AuthGate = ({ 
  children, 
  requireAuth = true 
}: AuthGateProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Töltés állapota
  if (loading) {
    return <PageLoading message="Hitelesítés ellenőrzése..." />;
  }

  // 2. Ha nem kötelező az auth (pl. Landing page, Demo oldalak), engedjük át
  // Az AppRoutes-ban a requireAuth={false} beállítással kezeljük a "Demo" útvonalakat
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 3. Ha kötelező az auth, de nincs user -> Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 4. Van user és kell auth -> Engedjük át (A szerepkört a RoleGate ellenőrzi majd)
  return <>{children}</>;
};

export default AuthGate;