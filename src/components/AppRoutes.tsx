import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { usePhaseFlags } from '@/hooks/usePhaseFlags';

import { ProtectedRoute } from '@/features/auth/guards';
import PhaseGuard from '@/components/PhaseGuard';
import RouteLoader from '@/components/RouteLoader';

import AppLayout from '@/components/layout/AppLayout';
import WinmixProRoutes from '@/winmixpro/WinmixProRoutes';

import Index from '@/pages/Index';
import Login from '@/pages/Auth/Login';
import Signup from '@/pages/Auth/Signup';
import NewPredictions from '@/pages/NewPredictions';
import Teams from '@/pages/Teams';
import Leagues from '@/pages/Leagues';
import Dashboard from '@/pages/Dashboard';
import PredictionsView from '@/pages/PredictionsView';
import Phase9 from '@/pages/Phase9';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import FeatureFlagsDemo from '@/pages/FeatureFlagsDemo';

const TeamDetail = React.lazy(() => import('@/pages/TeamDetail'));
const CrossLeague = React.lazy(() => import('@/pages/CrossLeague'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const EnvVariables = React.lazy(() => import('@/pages/EnvVariables'));
const MatchesPage = React.lazy(() => import('@/pages/MatchesPage'));
const MatchDetail = React.lazy(() => import('@/pages/MatchDetail'));
const ScheduledJobsPage = React.lazy(() => import('@/pages/ScheduledJobsPage'));
const ModelsPage = React.lazy(() => import('@/pages/ModelsPage'));
const MonitoringPage = React.lazy(() => import('@/pages/MonitoringPage'));
const AIChat = React.lazy(() => import('@/pages/AIChat'));

const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const UsersPage = React.lazy(() => import('@/pages/admin/users/UsersPage'));
const RunningJobsPage = React.lazy(() => import('@/pages/admin/jobs/RunningJobsPage'));
const Phase9SettingsPage = React.lazy(() => import('@/pages/admin/phase9/Phase9SettingsPage'));
const HealthDashboard = React.lazy(() => import('@/pages/admin/HealthDashboard'));
const IntegrationsPage = React.lazy(() => import('@/pages/admin/IntegrationsPage'));
const StatsPage = React.lazy(() => import('@/pages/admin/StatsPage'));
const ModelStatusDashboard = React.lazy(() => import('@/pages/admin/ModelStatusDashboard'));
const FeedbackInboxPage = React.lazy(() => import('@/pages/admin/FeedbackInboxPage'));
const SystemOverviewPage = React.lazy(() => import('@/pages/admin/SystemOverview'));

const defaultSuspense = (message: string) => <RouteLoader message={message} />;

const AppRoutes: React.FC = () => {
  const { isPhase5Enabled, isPhase6Enabled, isPhase7Enabled, isPhase8Enabled, isPhase9Enabled } = usePhaseFlags();

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={(
            <ProtectedRoute requireAuth={false} notify={false}>
              <Index />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/predictions"
          element={(
            <ProtectedRoute requireAuth={false} notify={false}>
              <PredictionsView />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/teams"
          element={(
            <ProtectedRoute requireAuth={false} notify={false}>
              <Teams />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/leagues"
          element={(
            <ProtectedRoute requireAuth={false} notify={false}>
              <Leagues />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/feature-flags"
          element={(
            <ProtectedRoute requireAuth={false} notify={false}>
              <FeatureFlagsDemo />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/matches"
          element={(
            <ProtectedRoute requireAuth={false} notify={false}>
              <Suspense fallback={defaultSuspense('Meccsek betöltése...')}>
                <MatchesPage />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/match/:id"
          element={(
            <ProtectedRoute requireAuth={false} notify={false}>
              <Suspense fallback={defaultSuspense('Meccs részletek betöltése...')}>
                <MatchDetail />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/teams/:teamName"
          element={(
            <ProtectedRoute requireAuth={false} notify={false}>
              <Suspense fallback={defaultSuspense('Csapat részletek betöltése...')}>
                <TeamDetail />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/ai-chat"
          element={(
            <ProtectedRoute requireAuth={false} notify={false}>
              <Suspense fallback={defaultSuspense('AI Chat betöltése...')}>
                <AIChat />
              </Suspense>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/predictions/new"
          element={(
            <ProtectedRoute>
              <NewPredictions />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/patterns"
          element={(
            <PhaseGuard phaseFlag={isPhase5Enabled}>
              <ProtectedRoute>
                <div>Phase 5 Pattern Detection</div>
              </ProtectedRoute>
            </PhaseGuard>
          )}
        />

        <Route
          path="/models"
          element={(
            <PhaseGuard phaseFlag={isPhase6Enabled}>
              <ProtectedRoute>
                <Suspense fallback={defaultSuspense('Modellek betöltése...')}>
                  <ModelsPage />
                </Suspense>
              </ProtectedRoute>
            </PhaseGuard>
          )}
        />

        <Route
          path="/crossleague"
          element={(
            <PhaseGuard phaseFlag={isPhase7Enabled}>
              <ProtectedRoute>
                <Suspense fallback={defaultSuspense('Cross-league elemzés...')}>
                  <CrossLeague />
                </Suspense>
              </ProtectedRoute>
            </PhaseGuard>
          )}
        />

        {isPhase8Enabled && (
          <>
            <Route
              path="/analytics"
              element={(
                <ProtectedRoute>
                  <Suspense fallback={defaultSuspense('Analitika betöltése...')}>
                    <Analytics />
                  </Suspense>
                </ProtectedRoute>
              )}
            />
            <Route
              path="/monitoring"
              element={(
                <ProtectedRoute>
                  <Suspense fallback={defaultSuspense('Monitorozás betöltése...')}>
                    <MonitoringPage />
                  </Suspense>
                </ProtectedRoute>
              )}
            />
          </>
        )}

        <Route
          path="/phase9"
          element={(
            <PhaseGuard phaseFlag={isPhase9Enabled}>
              <ProtectedRoute>
                <Phase9 />
              </ProtectedRoute>
            </PhaseGuard>
          )}
        />

        <Route
          path="/admin"
          element={(
            <ProtectedRoute allowedRoles={['admin', 'analyst']}>
              <Suspense fallback={defaultSuspense('Admin dashboard betöltése...')}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/system-overview"
          element={(
            <ProtectedRoute allowedRoles={['admin']}>
              <Suspense fallback={defaultSuspense('Rendszer áttekintés betöltése...')}>
                <SystemOverviewPage />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/users"
          element={(
            <ProtectedRoute allowedRoles={['admin']}>
              <Suspense fallback={defaultSuspense('Felhasználó kezelés...')}>
                <UsersPage />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/jobs"
          element={(
            <ProtectedRoute allowedRoles={['admin', 'analyst']}>
              <Suspense fallback={defaultSuspense('Folyamatok kezelése...')}>
                <RunningJobsPage />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/phase9"
          element={(
            <ProtectedRoute allowedRoles={['admin', 'analyst']}>
              <Suspense fallback={defaultSuspense('Phase 9 beállítások...')}>
                <Phase9SettingsPage />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/health"
          element={(
            <ProtectedRoute allowedRoles={['admin', 'analyst']}>
              <Suspense fallback={defaultSuspense('Rendszer egészség...')}>
                <HealthDashboard />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/stats"
          element={(
            <ProtectedRoute allowedRoles={['admin', 'analyst']}>
              <Suspense fallback={defaultSuspense('Statisztikák...')}>
                <StatsPage />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/integrations"
          element={(
            <ProtectedRoute allowedRoles={['admin', 'analyst']}>
              <Suspense fallback={defaultSuspense('Integrációk...')}>
                <IntegrationsPage />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/model-status"
          element={(
            <ProtectedRoute allowedRoles={['admin', 'analyst']}>
              <Suspense fallback={defaultSuspense('Modell státusz...')}>
                <ModelStatusDashboard />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/feedback"
          element={(
            <ProtectedRoute allowedRoles={['admin', 'analyst']}>
              <Suspense fallback={defaultSuspense('Visszajelzések...')}>
                <FeedbackInboxPage />
              </Suspense>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/environment"
          element={(
            <ProtectedRoute allowedRoles={['admin']}>
              <Suspense fallback={defaultSuspense('Környezeti változók...')}>
                <EnvVariables />
              </Suspense>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/jobs"
          element={(
            <PhaseGuard phaseFlag={isPhase5Enabled || isPhase6Enabled || isPhase7Enabled || isPhase8Enabled}>
              <ProtectedRoute allowedRoles={['admin', 'analyst']}>
                <Suspense fallback={defaultSuspense('Ütemezett feladatok...')}>
                  <ScheduledJobsPage />
                </Suspense>
              </ProtectedRoute>
            </PhaseGuard>
          )}
        />

        <Route
          path="/admin/models"
          element={(
            <PhaseGuard phaseFlag={isPhase6Enabled || isPhase8Enabled}>
              <ProtectedRoute allowedRoles={['admin', 'analyst']}>
                <Suspense fallback={defaultSuspense('Modellek...')}>
                  <ModelsPage />
                </Suspense>
              </ProtectedRoute>
            </PhaseGuard>
          )}
        />

        {isPhase8Enabled && (
          <>
            <Route
              path="/admin/matches"
              element={(
                <ProtectedRoute allowedRoles={['admin', 'analyst']}>
                  <Suspense fallback={defaultSuspense('Meccsek...')}>
                    <MatchesPage />
                  </Suspense>
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/monitoring"
              element={(
                <ProtectedRoute allowedRoles={['admin', 'analyst']}>
                  <Suspense fallback={defaultSuspense('Monitorozás...')}>
                    <MonitoringPage />
                  </Suspense>
                </ProtectedRoute>
              )}
            />
          </>
        )}
      </Route>

      <Route
        path="/login"
        element={(
          <ProtectedRoute requireAuth={false} notify={false}>
            <Login />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/signup"
        element={(
          <ProtectedRoute requireAuth={false} notify={false}>
            <Signup />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/unauthorized"
        element={(
          <ProtectedRoute requireAuth={false} notify={false}>
            <Unauthorized />
          </ProtectedRoute>
        )}
      />

      <Route path="/winmixpro/*" element={<WinmixProRoutes />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
