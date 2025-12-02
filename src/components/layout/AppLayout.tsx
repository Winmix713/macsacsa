import { Suspense, type ReactNode, useMemo } from "react";
import { Outlet } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppSidebar from "@/components/layout/AppSidebar";
import GlobalHeader from "@/components/layout/GlobalHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar.hooks";
import PageLoading from "@/components/ui/page-loading";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children?: ReactNode;
  useOutlet?: boolean;
  className?: string;
  showSidebar?: boolean;
  withErrorBoundary?: boolean;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
}

const readSidebarPreference = () => {
  if (typeof document === "undefined") {
    return true;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SIDEBAR_COOKIE_NAME}=`));

  if (!cookie) {
    return true;
  }

  const value = cookie.split("=")[1];
  return value !== "false";
};

const AppLayout = ({
  children,
  useOutlet = true,
  className,
  showSidebar = true,
  withErrorBoundary = true,
  loadingFallback,
  errorFallback,
}: AppLayoutProps) => {
  const content = useOutlet ? <Outlet /> : children;
  const defaultSidebarOpen = useMemo(() => readSidebarPreference(), []);

  const layout = (
    <SidebarProvider
      defaultOpen={defaultSidebarOpen}
      className="flex min-h-svh w-full bg-background text-foreground"
    >
      {showSidebar ? <AppSidebar /> : null}
      <SidebarInset className="flex min-h-svh flex-1 flex-col bg-background/95">
        <GlobalHeader />
        <div className={cn("flex-1 overflow-hidden", className)}>
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Suspense fallback={loadingFallback || <PageLoading message="Betöltés..." />}>
                  {content}
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );

  if (withErrorBoundary) {
    return <ErrorBoundary fallback={errorFallback}>{layout}</ErrorBoundary>;
  }

  return layout;
};

export default AppLayout;
