import type { QueryClient } from '@tanstack/react-query';

// The context every app's router is created with, so route loaders can warm the shared cache via
// `context.queryClient.ensureQueryData(...)`.
export interface RouterContext {
  queryClient: QueryClient;
}
