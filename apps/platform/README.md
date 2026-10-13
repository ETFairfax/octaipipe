# apps/platform

The deployable React frontend and the only app: the composition root for every domain package.
Architecture and layering are in [`docs/frontend-architecture.md`](../../docs/frontend-architecture.md);
startup and chrome are in [`src/shell/README.md`](./src/shell/README.md).

Scripts are in `package.json` (`dev` serves on a strict port; `dev:mock` answers the API from the
data packages' MSW handlers).

`src/mocks/browser.ts` re-registers the page with the MSW service worker on an interval and when the tab becomes visible. Browsers stop idle service workers, and a restarted one has forgotten the page, so without this it passes requests to the real network (a DNS error for a mock API host) until a reload. If mocks suddenly stop answering in `dev:mock`, look there first.

## Runtime config

The app fetches `config.json` at startup, so one image serves every environment. The schema is
`runtimeConfigSchema` in `packages/api-client/src/runtime-config.ts`.

- **Local dev:** copy `public/config.json.example` to `public/config.json` (git-ignored).
- **Deployed:** `docker/10-runtime-config.sh` writes it at container start from environment
  variables.