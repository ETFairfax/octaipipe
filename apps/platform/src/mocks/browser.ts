import { setupWorker } from 'msw/browser';
import { createHandlers } from './handlers.ts';

const reactivateIntervalMs = 10_000;

// MSW's worker remembers which pages to mock for in memory only. Browsers stop idle service
// workers, and a restarted one has forgotten this page, so it passes every request through to the
// real network (a DNS error for a mock API host) until the page reloads. Re-sending the message
// `worker.start()` uses to register the page makes the restarted worker mock for it again.
const keepPageRegistered = () => {
  const reactivate = () => navigator.serviceWorker.controller?.postMessage('MOCK_ACTIVATE');
  setInterval(reactivate, reactivateIntervalMs);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') reactivate();
  });
};

export const startMockWorker = async (apiUrl: string) => {
  const registration = await setupWorker(...createHandlers(apiUrl)).start({
    onUnhandledFrame: 'bypass'
  });
  keepPageRegistered();
  return registration;
};
