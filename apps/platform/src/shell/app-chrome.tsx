import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  ThemeToggle
} from '@workspace/ui/components';
import { readSidebarOpen } from '@workspace/ui/lib/sidebar-state';
import { cn } from '@workspace/ui/lib/utils';
import type { ReactNode } from 'react';
import { AppSwitcher } from './app-switcher.tsx';

export interface AppChromeProps {
  children: ReactNode;
  contentClassName?: string;
  // Each app's own navigation, rendered into the sidebar body. A ReactNode slot rather than a
  // data array so an app can use its own type-safe `<Link>` with `activeProps` -- a shared
  // component taking `{ title, url }[]` could only ever produce untyped `<a href>`s, since each
  // app's route types are its own (issue #110).
  sidebarNav?: ReactNode;
}

export function AppChrome({ children, contentClassName, sidebarNav }: AppChromeProps) {
  return (
    <SidebarProvider defaultOpen={readSidebarOpen()}>
      <Sidebar collapsible='icon'>
        <SidebarHeader>
          <AppSwitcher />
        </SidebarHeader>
        <SidebarContent>{sidebarNav}</SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <ThemeToggle />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden md:block'></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className={cn('flex flex-1 flex-col gap-4 p-4', contentClassName)}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
