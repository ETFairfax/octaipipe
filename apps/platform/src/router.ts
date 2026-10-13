import { createRouter } from '@tanstack/react-router';
import { RoutePending } from '@workspace/ui/components/route-pending';
import { queryClient } from './queryClient.ts';
import { DefaultErrorComponent } from './routeDefaults.tsx';
import { routeTree } from './routeTree.gen.ts';

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultErrorComponent: DefaultErrorComponent,
  defaultPendingComponent: RoutePending,
  defaultPendingMs: 200,
  defaultPendingMinMs: 300
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
