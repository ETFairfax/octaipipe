// The read side of the sidebar's collapse preference. `components/sidebar.tsx` (registry-owned)
// only ever *writes* the cookie: upstream shadcn's flow has a Next.js server component
// read it per request and hand it back as `SidebarProvider`'s `defaultOpen`. These apps are
// client-only SPAs with no such step, so without this the preference is written and never
// honoured. Lives here rather than in `components/sidebar.tsx` so a registry reinstall can't
// silently drop it.

// Must stay identical to SIDEBAR_COOKIE_NAME in components/sidebar.tsx, which is where the value
// is written.
const SIDEBAR_COOKIE_NAME = 'sidebar_state';

// Defaults to open: an absent cookie means the user has never touched the trigger, and a
// first-time visitor should see the navigation rather than an icon rail.
export function readSidebarOpen(documentCookie: string = document.cookie): boolean {
  return documentCookie.split(';').every(entry => entry.trim() !== `${SIDEBAR_COOKIE_NAME}=false`);
}
