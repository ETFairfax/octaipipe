# Context Map

This is an early-stage monorepo. Per-context `CONTEXT.md` files are added lazily via `/domain-modeling` as domain language stabilises. Package layering and routing are described in [`docs/frontend-architecture.md`](./docs/frontend-architecture.md).

## Contexts

- [UI](./packages/ui/CONTEXT.md) — shared presentation-layer components and hooks consumed by the platform app and domain UI packages
- [API Client](./packages/api-client/CONTEXT.md) — horizontal transport: the `ky`-based API client, the global `QueryClient`/mutation-meta setup, and the runtime config document, consumed by `apps/platform` and domain data packages
- [Utils](./packages/utils/CONTEXT.md) — horizontal framework-agnostic helpers
- [Psychrometrics Data](./packages/psychrometrics-data/CONTEXT.md) — Psychrometrics domain data: site feed, humid-air physics, compliance rules
- [Psychrometrics](./packages/psychrometrics-ui/CONTEXT.md) — Psychrometrics domain UI: the psychrometric chart, its layers and the live site page
- [App Shell](./apps/platform/src/shell/CONTEXT.md) — the startup composition (`createApp`) and sidebar chrome (`AppChrome`, App Switcher, Sidebar Nav) that `apps/platform`'s `main.tsx` and root route render through

## System-wide decisions

No ADRs are recorded yet. System-wide decisions go in `docs/adr/` when they are made.
