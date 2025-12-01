import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { usePhaseFlags } from '@/hooks/usePhaseFlags';

// Components & Guards
import AuthGuard from '@/components/AuthGuard';
import PhaseGuard from '@/components/PhaseGuard';
import RouteLoader from '@/components/RouteLoader';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// WinmixPro Sub-routes
// FONTOS: Győződj meg róla, hogy a src/winmixpro/WinmixProRoutes.tsx fájl létezik!
import WinmixProRoutes from '@/winmixpro/WinmixProRoutes';

// Pages - Static Imports
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

// Lazy Loaded Pages
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

// Lazy Loaded Admin Pages
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const UsersPage = React.lazy(() => import('@/pages/admin/users/UsersPage'));
const RunningJobsPage = React.lazy(() => import('@/pages/admin/jobs/RunningJobsPage'));
const Phase9SettingsPage = React.lazy(() => import('@/pages/admin/phase9/Phase9SettingsPage'));
const HealthDashboard = React.lazy(() => import('@/pages/admin/HealthDashboard'));
const IntegrationsPage = React.lazy(() => import('@/pages/admin/IntegrationsPage'));
const StatsPage = React.lazy(() => import('@/pages/admin/StatsPage'));
const ModelStatusDashboard = React.lazy(() => import('@/pages/admin/ModelStatusDashboard'));
const FeedbackInboxPage = React.lazy(() => import('@/pages/admin/FeedbackInboxPage'));

const AppRoutes: React.FC = () => {
  const { isPhase5Enabled, isPhase6Enabled, isPhase7Enabled, isPhase8Enabled, isPhase9Enabled } = usePhaseFlags();

  return (
    <Routes>
      {/* ------------------------------------------------------------------------- */}
      {/* APP LAYOUT WRAPPER (Sidebar + Navbar + Content Container)                 */}
      {/* ------------------------------------------------------------------------- */}
      <Route element={<AppLayout />}>
        
        {/* PUBLIC PAGES (With Layout) */}
        <Route path="/" element={<AuthGuard requireAuth={false}><Index /></AuthGuard>} />
        <Route path="/predictions" element={<AuthGuard requireAuth={false}><PredictionsView /></AuthGuard>} />
        <Route path="/teams" element={<AuthGuard requireAuth={false}><Teams /></AuthGuard>} />
        <Route path="/leagues" element={<AuthGuard requireAuth={false}><Leagues /></AuthGuard>} />
        <Route path="/feature-flags" element={<AuthGuard requireAuth={false}><FeatureFlagsDemo /></AuthGuard>} />
        
        <Route path="/matches" element={
          <AuthGuard requireAuth={false}>
            <Suspense fallback={<RouteLoader message="Meccsek betöltése..." />}>
              <MatchesPage />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="/match/:id" element={
          <AuthGuard requireAuth={false}>
            <Suspense fallback={<RouteLoader message="Meccs részletek betöltése..." />}>
              <MatchDetail />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="/teams/:teamName" element={
          <AuthGuard requireAuth={false}>
            <Suspense fallback={<RouteLoader message="Csapat részletek betöltése..." />}>
              <TeamDetail />
            </Suspense>
          </AuthGuard>
        } />

        <Route path="/ai-chat" element={
          <AuthGuard requireAuth={false}>
            <Suspense fallback={<RouteLoader message="AI Chat betöltése..." />}>
              <AIChat />
            </Suspense>
          </AuthGuard>
        } />

        {/* PROTECTED USER PAGES */}
        <Route path="/predictions/new" element={<AuthGuard><NewPredictions /></AuthGuard>} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />

        {/* PHASE GATED PAGES */}
        <Route path="/patterns" element={
          <PhaseGuard phaseFlag={isPhase5Enabled}>
            <AuthGuard><div>Phase 5 Pattern Detection</div></AuthGuard>
          </PhaseGuard>
        } />

        <Route path="/models" element={
          <PhaseGuard phaseFlag={isPhase6Enabled}>
            <AuthGuard>
              <Suspense fallback={<RouteLoader message="Modellek betöltése..." />}>
                <ModelsPage />
              </Suspense>
            </AuthGuard>
          </PhaseGuard>
        } />

        <Route path="/crossleague" element={
          <PhaseGuard phaseFlag={isPhase7Enabled}>
            <AuthGuard>
              <Suspense fallback={<RouteLoader message="Cross-league elemzés..." />}>
                <CrossLeague />
              </Suspense>
            </AuthGuard>
          </PhaseGuard>
        } />

        {isPhase8Enabled && (
          <>
            <Route path="/analytics" element={
              <AuthGuard>
                <Suspense fallback={<RouteLoader message="Analitika betöltése..." />}>
                  <Analytics />
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/monitoring" element={
              <AuthGuard>
                <Suspense fallback={<RouteLoader message="Monitorozás betöltése..." />}>
                  <MonitoringPage />
                </Suspense>
              </AuthGuard>
            } />
          </>
        )}

        <Route path="/phase9" element={
          <PhaseGuard phaseFlag={isPhase9Enabled}>
            <AuthGuard><Phase9 /></AuthGuard>
          </PhaseGuard>
        } />

        {/* ADMIN PAGES */}
        <Route path="/admin" element={
          <AuthGuard allowedRoles={["admin", "analyst"]}>
            <Suspense fallback={<RouteLoader message="Admin dashboard betöltése..." />}>
              <AdminDashboard />
            </Suspense>
          </AuthGuard>
        } />

        <Route path="/admin/users" element={
          <AuthGuard allowedRoles={["admin"]}>
            <Suspense fallback={<RouteLoader message="Felhasználó kezelés..." />}>
              <UsersPage />
            </Suspense>
          </AuthGuard>
        } />

        <Route path="/admin/jobs" element={
          <AuthGuard allowedRoles={["admin", "analyst"]}>
            <Suspense fallback={<RouteLoader message="Folyamatok kezelése..." />}>
              <RunningJobsPage />
            </Suspense>
          </AuthGuard>
        } />

        <Route path="/admin/phase9" element={
          <AuthGuard allowedRoles={["admin", "analyst"]}>
            <Suspense fallback={<RouteLoader message="Phase 9 beállítások..." />}>
              <Phase9SettingsPage />
            </Suspense>
          </AuthGuard>
        } />

        <Route path="/admin/health" element={
          <AuthGuard allowedRoles={["admin", "analyst"]}>
            <Suspense fallback={<RouteLoader message="Rendszer egészség..." />}>
              <HealthDashboard />
            </Suspense>
          </AuthGuard>
        } />

        <Route path="/admin/stats" element={
          <AuthGuard allowedRoles={["admin", "analyst"]}>
            <Suspense fallback={<RouteLoader message="Statisztikák..." />}>
              <StatsPage />
            </Suspense>
          </AuthGuard>
        } />

        <Route path="/admin/integrations" element={
          <AuthGuard allowedRoles={["admin", "analyst"]}>
            <Suspense fallback={<RouteLoader message="Integrációk..." />}>
              <IntegrationsPage />
            </Suspense>
          </AuthGuard>
        } />

        <Route path="/admin/model-status" element={
          <AuthGuard allowedRoles={["admin", "analyst"]}>
            <Suspense fallback={<RouteLoader message="Modell státusz..." />}>
              <ModelStatusDashboard />
            </Suspense>
          </AuthGuard>
        } />

        <Route path="/admin/feedback" element={
          <AuthGuard allowedRoles={["admin", "analyst"]}>
            <Suspense fallback={<RouteLoader message="Visszajelzések..." />}>
              <FeedbackInboxPage />
            </Suspense>
          </AuthGuard>
        } />

        <Route path="/admin/environment" element={
          <AuthGuard allowedRoles={['admin']}>
            <Suspense fallback={<RouteLoader message="Környezeti változók..." />}>
              <EnvVariables />
            </Suspense>
          </AuthGuard>
        } />

        {/* Legacy / Compatibility Admin Routes */}
        <Route path="/jobs" element={
          <PhaseGuard phaseFlag={isPhase5Enabled || isPhase6Enabled || isPhase7Enabled || isPhase8Enabled}>
            <AuthGuard allowedRoles={['admin', 'analyst']}>
              <Suspense fallback={<RouteLoader message="Ütemezett feladatok..." />}>
                <ScheduledJobsPage />
              </Suspense>
            </AuthGuard>
          </PhaseGuard>
        } />

        <Route path="/admin/models" element={
          <PhaseGuard phaseFlag={isPhase6Enabled || isPhase8Enabled}>
            <AuthGuard allowedRoles={['admin', 'analyst']}>
              <Suspense fallback={<RouteLoader message="Modellek..." />}>
                <ModelsPage />
              </Suspense>
            </AuthGuard>
          </PhaseGuard>
        } />

        {isPhase8Enabled && (
          <>
            <Route path="/admin/matches" element={
              <AuthGuard allowedRoles={['admin', 'analyst']}>
                <Suspense fallback={<RouteLoader message="Meccsek..." />}>
                  <MatchesPage />
                </Suspense>
              </AuthGuard>
            } />
            <Route path="/admin/monitoring" element={
              <AuthGuard allowedRoles={['admin', 'analyst']}>
                <Suspense fallback={<RouteLoader message="Monitorozás..." />}>
                  <MonitoringPage />
                </Suspense>
              </AuthGuard>
            } />
          </>
        )}

      </Route> {/* End of AppLayout */}


      {/* ------------------------------------------------------------------------- */}
      {/* FULL SCREEN PAGES (No Layout/Sidebar)                                     */}
      {/* ------------------------------------------------------------------------- */}
      <Route path="/login" element={<AuthGuard requireAuth={false}><Login /></AuthGuard>} />
      <Route path="/signup" element={<AuthGuard requireAuth={false}><Signup /></AuthGuard>} />
      <Route path="/unauthorized" element={<AuthGuard requireAuth={false}><Unauthorized /></AuthGuard>} />

      {/* ------------------------------------------------------------------------- */}
      {/* WINMIXPRO ROUTES (Has its own internal layout)                            */}
      {/* ------------------------------------------------------------------------- */}
      <Route path="/winmixpro/*" element={<WinmixProRoutes />} />

      {/* ------------------------------------------------------------------------- */}
      {/* FALLBACK                                                                  */}
      {/* ------------------------------------------------------------------------- */}
      <Route path="*" element={<NotFound />} />
      
    </Routes>
  );
};

export default AppRoutes;