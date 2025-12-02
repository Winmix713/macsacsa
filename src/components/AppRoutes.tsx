import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { FlaskConical, Sparkles } from "lucide-react";
import { usePhaseFlags } from "@/hooks/usePhaseFlags";

// Components & Guards
import AuthGuard from "@/components/AuthGuard";
import PhaseGuard from "@/components/PhaseGuard";
import RouteLoader from "@/components/RouteLoader";

// Layout
import AppLayout from "@/components/layout/AppLayout";

// WinmixPro Sub-routes
import WinmixProRoutes from "@/winmixpro/WinmixProRoutes";

// Pages - Static Imports
import Index from "@/pages/Index";
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
import NewPredictions from "@/pages/NewPredictions";
import Teams from "@/pages/Teams";
import Leagues from "@/pages/Leagues";
import Dashboard from "@/pages/Dashboard";
import PredictionsView from "@/pages/PredictionsView";
import Phase9 from "@/pages/Phase9";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import FeatureFlagsDemo from "@/pages/FeatureFlagsDemo";

// Lazy Loaded Pages
const TeamDetail = React.lazy(() => import("@/pages/TeamDetail"));
const CrossLeague = React.lazy(() => import("@/pages/CrossLeague"));
const Analytics = React.lazy(() => import("@/pages/Analytics"));
const EnvVariables = React.lazy(() => import("@/pages/EnvVariables"));
const MatchesPage = React.lazy(() => import("@/pages/MatchesPage"));
const MatchDetail = React.lazy(() => import("@/pages/MatchDetail"));
const ScheduledJobsPage = React.lazy(() => import("@/pages/ScheduledJobsPage"));
const ModelsPage = React.lazy(() => import("@/pages/ModelsPage"));
const MonitoringPage = React.lazy(() => import("@/pages/MonitoringPage"));
const AIChat = React.lazy(() => import("@/pages/AIChat"));

// Lazy Loaded Admin Pages
const AdminDashboard = React.lazy(() => import("@/pages/admin/AdminDashboard"));
const UsersPage = React.lazy(() => import("@/pages/admin/users/UsersPage"));
const RunningJobsPage = React.lazy(() => import("@/pages/admin/jobs/RunningJobsPage"));
const Phase9SettingsPage = React.lazy(() => import("@/pages/admin/phase9/Phase9SettingsPage"));
const HealthDashboard = React.lazy(() => import("@/pages/admin/HealthDashboard"));
const IntegrationsPage = React.lazy(() => import("@/pages/admin/IntegrationsPage"));
const StatsPage = React.lazy(() => import("@/pages/admin/StatsPage"));
const ModelStatusDashboard = React.lazy(() => import("@/pages/admin/ModelStatusDashboard"));
const FeedbackInboxPage = React.lazy(() => import("@/pages/admin/FeedbackInboxPage"));

import type { AppRouteHandle } from "@/types/router";

const AppRoutes: React.FC = () => {
  const { isPhase5Enabled, isPhase6Enabled, isPhase7Enabled, isPhase8Enabled, isPhase9Enabled } = usePhaseFlags();

  return (
    <Routes>
      <Route
        element={<AppLayout />}
        handle={{ hideFromBreadcrumb: true } satisfies AppRouteHandle}
      >
        <Route
          path="/"
          element={<AuthGuard requireAuth={false}><Index /></AuthGuard>}
          handle={{ breadcrumb: "Kezdőlap", navKey: "home" } satisfies AppRouteHandle}
        />
        <Route
          path="/predictions"
          element={<AuthGuard requireAuth={false}><PredictionsView /></AuthGuard>}
          handle={{
            breadcrumb: "Predikciók",
            navKey: "predictions",
            actions: [
              {
                key: "predictions-new",
                label: "Új predikció",
                to: "/predictions/new",
                icon: Sparkles,
              },
            ],
          } satisfies AppRouteHandle}
        />
        <Route
          path="/teams"
          element={<AuthGuard requireAuth={false}><Teams /></AuthGuard>}
          handle={{ breadcrumb: "Csapatok", navKey: "teams" } satisfies AppRouteHandle}
        />
        <Route
          path="/leagues"
          element={<AuthGuard requireAuth={false}><Leagues /></AuthGuard>}
          handle={{ breadcrumb: "Ligák", navKey: "leagues" } satisfies AppRouteHandle}
        />
        <Route
          path="/feature-flags"
          element={<AuthGuard requireAuth={false}><FeatureFlagsDemo /></AuthGuard>}
          handle={{ breadcrumb: "Feature Flags", navKey: "feature-flags" } satisfies AppRouteHandle}
        />
        <Route
          path="/matches"
          element={
            <AuthGuard requireAuth={false}>
              <Suspense fallback={<RouteLoader message="Meccsek betöltése..." />}>
                <MatchesPage />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "Mérkőzések", navKey: "matches" } satisfies AppRouteHandle}
        />
        <Route
          path="/match/:id"
          element={
            <AuthGuard requireAuth={false}>
              <Suspense fallback={<RouteLoader message="Meccs részletek betöltése..." />}>
                <MatchDetail />
              </Suspense>
            </AuthGuard>
          }
          handle={{
            breadcrumb: (params) => `Mérkőzés #${params.id ?? "?"}`,
            navKey: "matches",
          } satisfies AppRouteHandle}
        />
        <Route
          path="/teams/:teamName"
          element={
            <AuthGuard requireAuth={false}>
              <Suspense fallback={<RouteLoader message="Csapat részletek betöltése..." />}>
                <TeamDetail />
              </Suspense>
            </AuthGuard>
          }
          handle={{
            breadcrumb: (params) => decodeURIComponent(params.teamName ?? "Csapat"),
            navKey: "teams",
          } satisfies AppRouteHandle}
        />
        <Route
          path="/ai-chat"
          element={
            <AuthGuard requireAuth={false}>
              <Suspense fallback={<RouteLoader message="AI Chat betöltése..." />}>
                <AIChat />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "AI Chat", navKey: "ai-chat" } satisfies AppRouteHandle}
        />
        <Route
          path="/predictions/new"
          element={<AuthGuard><NewPredictions /></AuthGuard>}
          handle={{
            breadcrumb: "Új predikció",
            navKey: "predictions-new",
            actions: [
              {
                key: "predictions-list",
                label: "Predikciók",
                to: "/predictions",
                icon: Sparkles,
              },
            ],
          } satisfies AppRouteHandle}
        />
        <Route
          path="/dashboard"
          element={<AuthGuard><Dashboard /></AuthGuard>}
          handle={{
            breadcrumb: "Dashboard",
            navKey: "dashboard",
            actions: [
              {
                key: "dashboard-new-prediction",
                label: "Új predikció",
                to: "/predictions/new",
                icon: Sparkles,
              },
            ],
          } satisfies AppRouteHandle}
        />
        <Route
          path="/patterns"
          element={
            <PhaseGuard phaseFlag={isPhase5Enabled}>
              <AuthGuard><div>Phase 5 Pattern Detection</div></AuthGuard>
            </PhaseGuard>
          }
          handle={{ breadcrumb: "Mintafelismerés", navKey: "patterns" } satisfies AppRouteHandle}
        />
        <Route
          path="/models"
          element={
            <PhaseGuard phaseFlag={isPhase6Enabled}>
              <AuthGuard>
                <Suspense fallback={<RouteLoader message="Modellek betöltése..." />}>
                  <ModelsPage />
                </Suspense>
              </AuthGuard>
            </PhaseGuard>
          }
          handle={{
            breadcrumb: "Modellek",
            navKey: "models",
            actions: [
              {
                key: "admin-models",
                label: "Admin modellek",
                to: "/admin/models",
                icon: FlaskConical,
                roles: ["admin", "analyst"],
                featureFlag: "phase6",
              },
            ],
          } satisfies AppRouteHandle}
        />
        <Route
          path="/crossleague"
          element={
            <PhaseGuard phaseFlag={isPhase7Enabled}>
              <AuthGuard>
                <Suspense fallback={<RouteLoader message="Cross-league elemzés..." />}>
                  <CrossLeague />
                </Suspense>
              </AuthGuard>
            </PhaseGuard>
          }
          handle={{ breadcrumb: "Cross-League", navKey: "crossleague" } satisfies AppRouteHandle}
        />
        {isPhase8Enabled && (
          <>
            <Route
              path="/analytics"
              element={
                <AuthGuard>
                  <Suspense fallback={<RouteLoader message="Analitika betöltése..." />}>
                    <Analytics />
                  </Suspense>
                </AuthGuard>
              }
              handle={{ breadcrumb: "Analitika", navKey: "analytics" } satisfies AppRouteHandle}
            />
            <Route
              path="/monitoring"
              element={
                <AuthGuard>
                  <Suspense fallback={<RouteLoader message="Monitorozás betöltése..." />}>
                    <MonitoringPage />
                  </Suspense>
                </AuthGuard>
              }
              handle={{ breadcrumb: "Monitoring", navKey: "monitoring" } satisfies AppRouteHandle}
            />
          </>
        )}
        <Route
          path="/phase9"
          element={
            <PhaseGuard phaseFlag={isPhase9Enabled}>
              <AuthGuard><Phase9 /></AuthGuard>
            </PhaseGuard>
          }
          handle={{ breadcrumb: "Phase 9", navKey: "phase9" } satisfies AppRouteHandle}
        />
        <Route
          path="/admin"
          element={
            <AuthGuard allowedRoles={["admin", "analyst"]}>
              <Suspense fallback={<RouteLoader message="Admin dashboard betöltése..." />}>
                <AdminDashboard />
              </Suspense>
            </AuthGuard>
          }
          handle={{
            breadcrumb: "Admin",
            navKey: "admin",
            actions: [
              {
                key: "admin-model-center",
                label: "Modellek",
                to: "/admin/models",
                icon: FlaskConical,
                roles: ["admin", "analyst"],
                featureFlag: "phase6",
              },
            ],
          } satisfies AppRouteHandle}
        />
        <Route
          path="/admin/users"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <Suspense fallback={<RouteLoader message="Felhasználó kezelés..." />}>
                <UsersPage />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "Felhasználók", navKey: "admin-users" } satisfies AppRouteHandle}
        />
        <Route
          path="/admin/jobs"
          element={
            <AuthGuard allowedRoles={["admin", "analyst"]}>
              <Suspense fallback={<RouteLoader message="Folyamatok kezelése..." />}>
                <RunningJobsPage />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "Admin folyamatok", navKey: "admin-jobs" } satisfies AppRouteHandle}
        />
        <Route
          path="/admin/phase9"
          element={
            <AuthGuard allowedRoles={["admin", "analyst"]}>
              <Suspense fallback={<RouteLoader message="Phase 9 beállítások..." />}>
                <Phase9SettingsPage />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "Phase 9 beállítás", navKey: "admin-phase9" } satisfies AppRouteHandle}
        />
        <Route
          path="/admin/health"
          element={
            <AuthGuard allowedRoles={["admin", "analyst"]}>
              <Suspense fallback={<RouteLoader message="Rendszer egészség..." />}>
                <HealthDashboard />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "Rendszer egészség", navKey: "admin-health" } satisfies AppRouteHandle}
        />
        <Route
          path="/admin/stats"
          element={
            <AuthGuard allowedRoles={["admin", "analyst"]}>
              <Suspense fallback={<RouteLoader message="Statisztikák..." />}>
                <StatsPage />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "Admin statisztikák", navKey: "admin-stats" } satisfies AppRouteHandle}
        />
        <Route
          path="/admin/integrations"
          element={
            <AuthGuard allowedRoles={["admin", "analyst"]}>
              <Suspense fallback={<RouteLoader message="Integrációk..." />}>
                <IntegrationsPage />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "Integrációk", navKey: "admin-integrations" } satisfies AppRouteHandle}
        />
        <Route
          path="/admin/model-status"
          element={
            <AuthGuard allowedRoles={["admin", "analyst"]}>
              <Suspense fallback={<RouteLoader message="Modell státusz..." />}>
                <ModelStatusDashboard />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "Model státusz", navKey: "admin-model-status" } satisfies AppRouteHandle}
        />
        <Route
          path="/admin/feedback"
          element={
            <AuthGuard allowedRoles={["admin", "analyst"]}>
              <Suspense fallback={<RouteLoader message="Visszajelzések..." />}>
                <FeedbackInboxPage />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "Visszajelzések", navKey: "admin-feedback" } satisfies AppRouteHandle}
        />
        <Route
          path="/admin/environment"
          element={
            <AuthGuard allowedRoles={["admin"]}>
              <Suspense fallback={<RouteLoader message="Környezeti változók..." />}>
                <EnvVariables />
              </Suspense>
            </AuthGuard>
          }
          handle={{ breadcrumb: "Környezeti változók", navKey: "admin-environment" } satisfies AppRouteHandle}
        />
        <Route
          path="/jobs"
          element={
            <PhaseGuard phaseFlag={isPhase5Enabled || isPhase6Enabled || isPhase7Enabled || isPhase8Enabled}>
              <AuthGuard allowedRoles={["admin", "analyst"]}>
                <Suspense fallback={<RouteLoader message="Ütemezett feladatok..." />}>
                  <ScheduledJobsPage />
                </Suspense>
              </AuthGuard>
            </PhaseGuard>
          }
          handle={{ breadcrumb: "Scheduler", navKey: "jobs" } satisfies AppRouteHandle}
        />
        <Route
          path="/admin/models"
          element={
            <PhaseGuard phaseFlag={isPhase6Enabled || isPhase8Enabled}>
              <AuthGuard allowedRoles={["admin", "analyst"]}>
                <Suspense fallback={<RouteLoader message="Modellek..." />}>
                  <ModelsPage />
                </Suspense>
              </AuthGuard>
            </PhaseGuard>
          }
          handle={{ breadcrumb: "Admin modellek", navKey: "admin-models" } satisfies AppRouteHandle}
        />
        {isPhase8Enabled && (
          <>
            <Route
              path="/admin/matches"
              element={
                <AuthGuard allowedRoles={["admin", "analyst"]}>
                  <Suspense fallback={<RouteLoader message="Meccsek..." />}>
                    <MatchesPage />
                  </Suspense>
                </AuthGuard>
              }
              handle={{ breadcrumb: "Admin mérkőzések", navKey: "admin-matches" } satisfies AppRouteHandle}
            />
            <Route
              path="/admin/monitoring"
              element={
                <AuthGuard allowedRoles={["admin", "analyst"]}>
                  <Suspense fallback={<RouteLoader message="Monitorozás..." />}>
                    <MonitoringPage />
                  </Suspense>
                </AuthGuard>
              }
              handle={{ breadcrumb: "Admin monitoring", navKey: "admin-monitoring" } satisfies AppRouteHandle}
            />
          </>
        )}
      </Route>

      <Route path="/login" element={<AuthGuard requireAuth={false}><Login /></AuthGuard>} />
      <Route path="/signup" element={<AuthGuard requireAuth={false}><Signup /></AuthGuard>} />
      <Route path="/unauthorized" element={<AuthGuard requireAuth={false}><Unauthorized /></AuthGuard>} />

      <Route path="/winmixpro/*" element={<WinmixProRoutes />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
