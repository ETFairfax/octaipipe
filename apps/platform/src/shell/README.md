# App shell

The composition module `apps/platform` starts and renders through: `createApp` (`create-app.tsx`)
for startup and `AppChrome` (`app-chrome.tsx`) for the sidebar frame. Terms are in
[`CONTEXT.md`](./CONTEXT.md).

Invariants that aren't obvious from any single file:

- Apps don't hand-wire providers; `main.tsx` calls `createApp`, which owns the runtime-config fetch
  and the provider nesting.
- The `queryClient` passed to `createApp` must be the same instance the router was created with as
  context, so loaders and components share one cache.
- Chrome belongs to the `_app-shell` layout route, not `__root`, so full-page routes such as Sign In
  render without it.
- Cross-app links use real `<a href>` navigations, never TanStack `<Link>`s, because other apps are
  separate bundles with their own router basepath.
