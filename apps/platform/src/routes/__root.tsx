import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { RouterContext } from '@workspace/api-client';
import { NotFound } from '@workspace/ui/components/not-found';

function RootLayout() {
  return <Outlet />;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound
});
