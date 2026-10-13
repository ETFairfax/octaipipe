# App Shell

The startup composition and sidebar chrome that `apps/platform`'s `main.tsx` and root route render
through. Usage lives in [`README.md`](./README.md).

## Language

**createApp**:
The one function that fetches the runtime config and mounts the fixed provider nesting around the
router. Apps do not hand-assemble providers.
_Avoid_: Wiring providers directly in `main.tsx`.

**AppChrome**:
The sidebar frame (header, nav body, footer, `SidebarInset` content area) rendered by the
`_app-shell` layout route. Takes the app's navigation as a `sidebarNav` slot.
_Avoid_: Putting chrome in `__root.tsx`; public full-page routes such as Sign In render outside it.

**Sidebar Nav**:
The app's own navigation, rendered into `AppChrome`'s `sidebarNav` slot (`components/sidebar-nav.tsx`).
It is a slot, not shared data, because each app's route types are its own.
_Avoid_: Moving nav items into the shell.

**App Switcher**:
The sidebar-header dropdown for jumping between deployed apps. Cross-app links are real
`<a href>` document navigations, never TanStack `<Link>`s._Avoid_: Using `<Link>` for another app's URL.
