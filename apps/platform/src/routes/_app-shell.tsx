import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SidebarNav } from '../components/sidebar-nav.tsx';
import { DefaultErrorComponent } from '../routeDefaults.tsx';
import { AppChrome } from '../shell/index.ts';

export const Route = createFileRoute('/_app-shell')({
  errorComponent: DefaultErrorComponent,
  component: () => (
    <AppChrome sidebarNav={<SidebarNav />}>
      <Outlet />
    </AppChrome>
  )
});
