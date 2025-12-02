import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/providers/AuthProvider";
import type { FeatureFlag } from "@/providers/FeatureFlagsProvider";

export type FeatureFlagKey = keyof FeatureFlag;

export type RouteActionVariant = "default" | "outline" | "secondary" | "ghost";

export interface RouteAction {
  key: string;
  label: string;
  to?: string;
  icon?: LucideIcon;
  variant?: RouteActionVariant;
  roles?: UserRole[];
  featureFlag?: FeatureFlagKey;
}

export type BreadcrumbValue = string | ((params: Record<string, string>) => string);

export interface AppRouteHandle {
  breadcrumb?: BreadcrumbValue;
  breadcrumbHref?: string;
  hideFromBreadcrumb?: boolean;
  navKey?: string;
  actions?: RouteAction[];
}
