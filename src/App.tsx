import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';
import { FeatureFlagsProvider } from '@/providers/FeatureFlagsProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import AppRoutes from '@/components/AppRoutes';
import ErrorBoundary from '@/components/ErrorBoundary';
import logger from '@/lib/logger';
import { captureExceptionSafe } from '@/lib/sentry';
import { env } from '@/config/env';

// Fontos: Az App.css-t NE importáld be, mert elrontja a layoutot!
// import './App.css'; // TÖRÖLVE/KIKOMMENTELVE

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // JAVÍTÁS: Prod-ban legyen true (friss adat), Dev-ben false (ne ugráljon debug közben)
      // Vagy ha nem akarod, hogy fókuszváltáskor töltsön: false
      refetchOnWindowFocus: env.isProd, 
      
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1,
      onError: error => {
        // Dev módban is lássuk a konzolon a hibát
        logger.error('Mutation error:', error);
        if (env.isProd) {
          captureExceptionSafe(error);
        }
      }
    }
  }
});

const App = () => (
  <ErrorBoundary 
    onError={(error, info) => {
      logger.error('Unhandled UI error', error, {
        componentStack: info.componentStack
      }, 'ErrorBoundary');
      captureExceptionSafe(error, {
        componentStack: info.componentStack
      });
    }}
  >
    <QueryClientProvider client={queryClient}>
      {/* enableSystem={true} fontos a rendszer téma érzékeléséhez */}
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <AuthProvider>
              <FeatureFlagsProvider>
                <AppRoutes />
                <Toaster />
              </FeatureFlagsProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;