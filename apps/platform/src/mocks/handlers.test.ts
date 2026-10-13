import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createHandlers } from './handlers.ts';

describe('createHandlers', () => {
  const server = setupServer(...createHandlers('https://trailing-slash.test/'));
  beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
  afterAll(() => server.close());

  it('matches requests when the api url has a trailing slash', async () => {
    const response = await fetch('https://trailing-slash.test/psychrometrics/sites');

    expect(response.ok).toBe(true);
  });
});
