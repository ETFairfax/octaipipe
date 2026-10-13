import type { QueryClient } from '@tanstack/react-query';
import { type AnyRouter, RouterProvider } from '@tanstack/react-router';
import { ApiClientProvider, loadRuntimeConfig, QueryProvider } from '@workspace/api-client';
import { CookieBanner, ThemeProvider, Toaster } from '@workspace/ui/components';
import { type ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function AuthenticatedApiClientProvider({
  apiUrl,
  children
}: {
  apiUrl: string;
  children: ReactNode;
}) {
  return (
    <ApiClientProvider apiUrl={apiUrl} getAccessToken={() => Promise.resolve('xxx')}>
      {children}
    </ApiClientProvider>
  );
}

export interface CreateAppOptions<TRouter extends AnyRouter> {
  router: TRouter;
  // The one shared QueryClient: the same instance the router was created with as context, so
  // route loaders and components read and write a single cache.
  queryClient: QueryClient;
  // Every app's index.html has a `<div id="root">` -- only ever overridden by tests.
  rootElementId?: string;
}

export interface App {
  mount(): Promise<void>;
}

export function createApp<TRouter extends AnyRouter>(options: CreateAppOptions<TRouter>): App {
  const { router, queryClient, rootElementId = 'root' } = options;

  async function mount(): Promise<void> {
    const rootElement = document.getElementById(rootElementId);
    if (!rootElement) {
      throw new Error(`createApp: no element with id "${rootElementId}" found`);
    }

    try {
      const config = await loadRuntimeConfig();

      const tree = (
        <StrictMode>
          <AuthenticatedApiClientProvider apiUrl={config.apiUrl}>
            <ThemeProvider>
              <QueryProvider client={queryClient}>
                <RouterProvider router={router} />
              </QueryProvider>
              <CookieBanner />
              <Toaster />
            </ThemeProvider>
          </AuthenticatedApiClientProvider>
        </StrictMode>
      );

      createRoot(rootElement).render(tree);
    } catch (error) {
      createRoot(rootElement).render(
        <p className='text-sm text-destructive'>
          Failed to load configuration: {(error as Error).message}
        </p>
      );
    }
  }

  return { mount };
}
