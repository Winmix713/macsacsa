import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import RouteLoader from '@/components/RouteLoader';

// Lazy load WinmixPro components - Ezek szerepeltek az eredeti listádban
const WinmixProLayout = React.lazy(() => import('@/winmixpro/WinmixProLayout'));
const WinmixProAdminUsers = React.lazy(() => import('@/winmixpro/pages/AdminUsers'));
const WinmixProAdminJobs = React.lazy(() => import('@/winmixpro/pages/AdminJobs'));
const WinmixProAdminModels = React.lazy(() => import('@/winmixpro/pages/AdminModels'));
const WinmixProAdminHealth = React.lazy(() => import('@/winmixpro/pages/AdminHealth'));
const WinmixProAdminIntegrations = React.lazy(() => import('@/winmixpro/pages/AdminIntegrations'));
const WinmixProAdminStats = React.lazy(() => import('@/winmixpro/pages/AdminStats'));
const WinmixProAdminFeedback = React.lazy(() => import('@/winmixpro/pages/AdminFeedback'));
const WinmixProAdminPredictions = React.lazy(() => import('@/winmixpro/pages/AdminPredictions'));
const WinmixProAdminPhase9 = React.lazy(() => import('@/winmixpro/pages/AdminPhase9'));
const WinmixProAdminThemes = React.lazy(() => import('@/winmixpro/pages/AdminThemes'));
const WinmixProAdminUIControls = React.lazy(() => import('@/winmixpro/pages/AdminUIControls'));

// Ezt kikommenteltem, mert valószínűleg ez okozza a hibát, ha nem létezik a fájl.
// Ha létezik a @/winmixpro/pages/AdminDashboard.tsx, akkor vedd ki a kommentből!
// const WinmixProAdminDashboard = React.lazy(() => import('@/winmixpro/pages/AdminDashboard')); 

// EZEKET TÖRÖLTEM/KIKOMMENTELTEM, MERT EZEK OKOZTÁK A HIBÁT (nem létező fájlok):
// const WinmixProAdminFeatures = React.lazy(() => import('@/winmixpro/pages/AdminFeatures'));
// const WinmixProAdminDesign = React.lazy(() => import('@/winmixpro/pages/AdminDesign'));
// const WinmixProAdminComponents = React.lazy(() => import('@/winmixpro/pages/AdminComponents'));

const WinmixProRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthGuard requireAuth={false}>
            <Suspense fallback={<RouteLoader message="WinmixPro felület betöltése..." />}>
              <WinmixProLayout />
            </Suspense>
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="users" replace />} />
        
        {/* Core WinmixPro Pages - Ezek biztosan működnek */}
        <Route path="users" element={<Suspense fallback={<RouteLoader message="Felhasználók..." />}><WinmixProAdminUsers /></Suspense>} />
        <Route path="jobs" element={<Suspense fallback={<RouteLoader message="Folyamatok..." />}><WinmixProAdminJobs /></Suspense>} />
        <Route path="models" element={<Suspense fallback={<RouteLoader message="Modellek..." />}><WinmixProAdminModels /></Suspense>} />
        <Route path="health" element={<Suspense fallback={<RouteLoader message="Rendszer egészség..." />}><WinmixProAdminHealth /></Suspense>} />
        <Route path="integrations" element={<Suspense fallback={<RouteLoader message="Integrációk..." />}><WinmixProAdminIntegrations /></Suspense>} />
        <Route path="stats" element={<Suspense fallback={<RouteLoader message="Statisztikák..." />}><WinmixProAdminStats /></Suspense>} />
        <Route path="feedback" element={<Suspense fallback={<RouteLoader message="Visszajelzések..." />}><WinmixProAdminFeedback /></Suspense>} />
        <Route path="predictions" element={<Suspense fallback={<RouteLoader message="Predikciók..." />}><WinmixProAdminPredictions /></Suspense>} />
        <Route path="phase9" element={<Suspense fallback={<RouteLoader message="Phase 9..." />}><WinmixProAdminPhase9 /></Suspense>} />
        <Route path="themes" element={<Suspense fallback={<RouteLoader message="Témák..." />}><WinmixProAdminThemes /></Suspense>} />
        <Route path="ui-controls" element={<Suspense fallback={<RouteLoader message="UI mátrix..." />}><WinmixProAdminUIControls /></Suspense>} />

        {/* 
            A "nested" admin útvonalakat (features, design, components) kivettem, 
            mert a fájlok hiányoznak. Ha később létrehozod őket, ide szúrd be őket újra.
        */}
      </Route>
    </Routes>
  );
};

export default WinmixProRoutes;