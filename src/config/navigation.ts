import {
  Activity,
  BarChart3,
  Bot,
  Brain,
  Calendar as CalendarIcon,
  Clock,
  FlaskConical,
  Gauge,
  HeartPulse,
  Home,
  Key,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Network,
  Plug,
  Shield,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/providers/AuthProvider";
import type { FeatureFlagKey } from "@/types/router";

export interface NavigationItem {
  key: string;
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  roles?: UserRole[];
  featureFlag?: FeatureFlagKey;
  exact?: boolean;
}

export interface NavigationSection {
  key: string;
  title?: string;
  items: NavigationItem[];
}

export const navigationConfig: NavigationSection[] = [
  {
    key: "overview",
    title: "Áttekintés",
    items: [
      { key: "home", title: "Kezdőlap", href: "/", icon: Home, exact: true },
      { key: "dashboard", title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { key: "analytics", title: "Analitika", href: "/analytics", icon: LineChart, featureFlag: "phase8" },
      { key: "ai-chat", title: "AI Chat", href: "/ai-chat", icon: Bot },
    ],
  },
  {
    key: "predictions",
    title: "Predikciók",
    items: [
      { key: "predictions-new", title: "Új predikció", href: "/predictions/new", icon: Sparkles },
      { key: "predictions", title: "Predikciók", href: "/predictions", icon: ListChecks },
      { key: "teams", title: "Csapatok", href: "/teams", icon: Users },
      { key: "matches", title: "Mérkőzések", href: "/matches", icon: CalendarIcon },
      { key: "leagues", title: "Ligák", href: "/leagues", icon: Trophy },
    ],
  },
  {
    key: "intelligence",
    title: "Intelligencia",
    items: [
      { key: "patterns", title: "Minta felismerés", href: "/patterns", icon: Shield, featureFlag: "phase5" },
      { key: "models", title: "Modellek", href: "/models", icon: FlaskConical, featureFlag: "phase6" },
      { key: "crossleague", title: "Cross-League", href: "/crossleague", icon: Network, featureFlag: "phase7" },
      { key: "monitoring", title: "Monitoring", href: "/monitoring", icon: Activity, featureFlag: "phase8" },
      { key: "phase9", title: "Phase 9", href: "/phase9", icon: Brain, featureFlag: "phase9" },
    ],
  },
  {
    key: "admin",
    title: "Adminisztráció",
    items: [
      { key: "admin", title: "Admin dashboard", href: "/admin", icon: ShieldCheck, roles: ["admin", "analyst"] },
      { key: "admin-jobs", title: "Futó folyamatok", href: "/admin/jobs", icon: Clock, roles: ["admin", "analyst"] },
      { key: "admin-models", title: "ML modellek", href: "/admin/models", icon: FlaskConical, roles: ["admin", "analyst"], featureFlag: "phase6" },
      { key: "admin-monitoring", title: "Admin monitoring", href: "/admin/monitoring", icon: Activity, roles: ["admin", "analyst"], featureFlag: "phase8" },
      { key: "admin-matches", title: "Admin mérkőzések", href: "/admin/matches", icon: CalendarIcon, roles: ["admin", "analyst"], featureFlag: "phase8" },
      { key: "admin-model-status", title: "Model status", href: "/admin/model-status", icon: Gauge, roles: ["admin", "analyst"] },
      { key: "admin-health", title: "Rendszer egészség", href: "/admin/health", icon: HeartPulse, roles: ["admin", "analyst"] },
      { key: "admin-stats", title: "Admin statisztikák", href: "/admin/stats", icon: BarChart3, roles: ["admin", "analyst"] },
      { key: "admin-integrations", title: "Integrációk", href: "/admin/integrations", icon: Plug, roles: ["admin", "analyst"] },
      { key: "admin-phase9", title: "Phase 9 beállítás", href: "/admin/phase9", icon: Brain, roles: ["admin", "analyst"], featureFlag: "phase9" },
      { key: "admin-feedback", title: "Visszajelzések", href: "/admin/feedback", icon: Shield, roles: ["admin", "analyst"] },
      { key: "admin-users", title: "Felhasználók", href: "/admin/users", icon: Users, roles: ["admin"] },
      { key: "admin-environment", title: "Környezeti változók", href: "/admin/environment", icon: Key, roles: ["admin"] },
      { key: "jobs", title: "Scheduler", href: "/jobs", icon: Clock, roles: ["admin", "analyst"] },
    ],
  },
];
