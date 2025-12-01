import React from 'react';
import { Navigate } from 'react-router-dom';

interface PhaseGuardProps {
  phaseFlag: boolean;
  children: React.ReactNode;
  redirectTo?: string;
}

const PhaseGuard: React.FC<PhaseGuardProps> = ({ 
  phaseFlag, 
  children, 
  redirectTo 
}) => {
  if (!phaseFlag) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return null; // Vagy egy "Feature Not Available" komponens
  }
  return <>{children}</>;
};

export default PhaseGuard;