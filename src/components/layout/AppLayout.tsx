import React, { Suspense, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/navigation/AppSidebar';
// Ellenőrizd, hogy a fájl neve nálad PageLoading.tsx vagy page-loading.tsx!
import PageLoading from '@/components/ui/page-loading'; 
import ErrorBoundary from '@/components/ErrorBoundary';

interface AppLayoutProps {
  children?: ReactNode;
  useOutlet?: boolean;
  className?: string;
  showSidebar?: boolean;
  withErrorBoundary?: boolean;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  useOutlet = true,
  className,
  showSidebar = true,
  withErrorBoundary = true,
  loadingFallback,
  errorFallback
}) => {
  const content = useOutlet ? <Outlet /> : children;

  const wrappedContent = (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - Fixen a bal oldalon */}
      {showSidebar && (
        <aside className="hidden lg:block shrink-0">
          <AppSidebar />
        </aside>
      )}

      {/* Fő tartalom terület - Ez tölti ki a maradék helyet */}
      <main 
        className={cn(
          'flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300',
          className
        )}
      >
        {/* Görgethető konténer */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
          <div className="mx-auto max-w-7xl animate-fade-in space-y-6">
            <Suspense fallback={loadingFallback || <PageLoading message="Betöltés..." />}>
              {content}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );

  if (withErrorBoundary) {
    return <ErrorBoundary fallback={errorFallback}>{wrappedContent}</ErrorBoundary>;
  }

  return wrappedContent;
};

export default AppLayout;