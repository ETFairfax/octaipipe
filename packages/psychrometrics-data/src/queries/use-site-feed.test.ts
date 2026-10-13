import { QueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { psychrometricsKeys } from '../keys.js';
import { createPsychrometricsHandlers } from '../mocks/handlers.js';
import type { ConditionsFile, Reading } from '../types/index.js';
import { type FeedSnapshot, getNextReadingOptions } from './use-site-feed.js';

const apiUrl = 'https://api.test';
const envelope = { dryBulbMinC: 18, dryBulbMaxC: 27 };
const reading = (minute: number) => ({
  timestamp: `2026-01-01T00:${String(minute).padStart(2, '0')}:00.000Z`,
  dryBulbC: 20 + minute,
  rhPct: 40
});
const conditions: ConditionsFile = {
  sites: [{ id: 'a', name: 'Hall A', envelope, readings: [0, 5, 10].map(reading) }]
};

const server = setupServer();
const apiClient = ky.create({ prefix: apiUrl });
const key = psychrometricsKeys.reading('a');

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const serveSteady = () =>
  server.use(
    ...createPsychrometricsHandlers(apiUrl, {
      conditions,
      wait: () => Promise.resolve(),
      random: () => 0.5
    })
  );

// One poll, as the refetch interval would make it.
const poll = (client: QueryClient) => client.fetchQuery(getNextReadingOptions(apiClient, 'a'));
const trailOf = (client: QueryClient): Reading[] =>
  client.getQueryData<FeedSnapshot>(key)?.trail ?? [];

describe('the site feed query', () => {
  it('caches a trail that grows by one reading per poll, oldest first', async () => {
    serveSteady();
    const client = new QueryClient();

    await poll(client);
    await poll(client);

    expect(trailOf(client).map(r => r.dryBulbC)).toEqual([20, 25]);
  });

  it('keeps the trail and retries from the same position when a poll fails', async () => {
    serveSteady();
    const client = new QueryClient();
    await poll(client);
    server.use(
      http.get(
        `${apiUrl}/psychrometrics/sites/:siteId/readings`,
        () => new HttpResponse(null, { status: 503 })
      )
    );

    await poll(client).catch(() => undefined);
    expect(trailOf(client)).toHaveLength(1);

    serveSteady();
    await poll(client);
    expect(trailOf(client).map(r => r.dryBulbC)).toEqual([20, 25]);
  });

  it('ends after the last reading as a success, with the trail intact', async () => {
    serveSteady();
    const client = new QueryClient();
    await poll(client);
    await poll(client);
    await poll(client);

    const snapshot = await poll(client);

    expect(snapshot.ended).toBe(true);
    expect(snapshot.trail).toHaveLength(3);
    expect(client.getQueryState(key)?.status).toBe('success');
    expect(client.getQueryState(key)?.error).toBeNull();
  });

  it('starts again from the first reading, with an empty trail, once reset', async () => {
    serveSteady();
    const client = new QueryClient();
    await poll(client);
    await poll(client);

    await client.resetQueries({ queryKey: key });
    expect(trailOf(client)).toEqual([]);

    await poll(client);
    expect(trailOf(client).map(r => r.dryBulbC)).toEqual([20]);
  });
});
