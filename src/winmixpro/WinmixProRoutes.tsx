import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/guards';
import RouteLoader from '@/components/RouteLoader';

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

const WinmixProRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={(
          <ProtectedRoute requireAuth={false} notify={false}>
            <Suspense fallback={<RouteLoader message="WinmixPro felület betöltése..." />}>
              <WinmixProLayout />
            </Suspense>
          </ProtectedRoute>
        )}
      >
        <Route index element={<Navigate to="users" replace />} />
        <Route
          path="users"
          element={(
            <Suspense fallback={<RouteLoader message="Felhasználók..." />}>
              <WinmixProAdminUsers />
            </Suspense>
          )}
        />
        <Route
          path="jobs"
          element={(
            <Suspense fallback={<RouteLoader message="Folyamatok..." />}>
              <WinmixProAdminJobs />
            </Suspense>
          )}
        />
        <Route
          path="models"
          element={(
            <Suspense fallback={<RouteLoader message="Modellek..." />}>
              <WinmixProAdminModels />
            </Suspense>
          )}
        />
        <Route
          path="health"
          element={(
            <Suspense fallback={<RouteLoader message="Rendszer egészség..." />}>
              <WinmixProAdminHealth />
            </Suspense>
          )}
        />
        <Route
          path="integrations"
          element={(
            <Suspense fallback={<RouteLoader message="Integrációk..." />}>
              <WinmixProAdminIntegrations />
            </Suspense>
          )}
        />
        <Route
          path="stats"
          element={(
            <Suspense fallback={<RouteLoader message="Statisztikák..." />}>
              <WinmixProAdminStats />
            </Suspense>
          )}
        />
        <Route
          path="feedback"
          element={(
            <Suspense fallback={<RouteLoader message="Visszajelzések..." />}>
              <WinmixProAdminFeedback />
            </Suspense>
          )}
        />
        <Route
          path="predictions"
          element={(
            <Suspense fallback={<RouteLoader message="Predikciók..." />}>
              <WinmixProAdminPredictions />
            </Suspense>
          )}
        />
        <Route
          path="phase9"
          element={(
            <Suspense fallback={<RouteLoader message="Phase 9..." />}>
              <WinmixProAdminPhase9 />
            </Suspense>
          )}
        />
        <Route
          path="themes"
          element={(
            <Suspense fallback={<RouteLoader message="Témák..." />}>
              <WinmixProAdminThemes />
            </Suspense>
          )}
        />
        <Route
          path="ui-controls"
          element={(
            <Suspense fallback={<RouteLoader message="UI mátrix..." />}>
              <WinmixProAdminUIControls />
            </Suspense>
          )}
        />
      </Route>
    </Routes>
  );
};

export default WinmixProRoutes;
