import { loadRuntimeConfig } from '@workspace/api-client';
import { queryClient } from './queryClient.ts';
import { router } from './router.ts';
import { createApp } from './shell/index.ts';

import '@workspace/ui/globals.css';

// Opt in with `pnpm dev:mock` (vite --mode mock) to answer the runtime config's `apiUrl` from the
// data packages' mock handlers instead of the real API. Dev only: the dynamic import is dropped
// from production builds.
if (import.meta.env.DEV && import.meta.env.MODE === 'mock') {
  const { apiUrl } = await loadRuntimeConfig();
  const { startMockWorker } = await import('./mocks/browser.ts');
  await startMockWorker(apiUrl);
}

// Runtime config fetch, provider wiring, and the config-fetch error fallback all live in
// shell/create-app.tsx (issue #97).
await createApp({
  router,
  queryClient
}).mount();
