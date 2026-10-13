import ky, { HTTPError } from 'ky';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { fetchSite } from '../queries/use-get-site.js';
import { fetchSites } from '../queries/use-get-sites.js';
import { fetchReadingAfter } from '../queries/use-site-feed.js';
import type { ConditionsFile } from '../types/index.js';
import { createPsychrometricsHandlers } from './handlers.js';

const apiUrl = 'https://api.test';
const envelope = { dryBulbMinC: 18, dryBulbMaxC: 27 };
const reading = (dryBulbC: number, minute = 0) => ({
  timestamp: `2026-01-01T00:0${minute}:00.000Z`,
  dryBulbC,
  rhPct: 40
});
const conditions: ConditionsFile = {
  sites: [
    { id: 'a', name: 'Hall A', envelope, readings: [reading(20), reading(21, 5)] },
    { id: 'b', name: 'Hall B', envelope, readings: [reading(10)] }
  ]
};

const instant = () => Promise.resolve();
// Per poll the handlers draw: slow?, delay, fail?. 0.5 is a normal call, 0.01 a slow or failing
// one, 0.99 a successful one.
const steady = () => 0.5;
const alwaysFail = () => 0;
const sequence = (...values: number[]) => {
  const queue = [...values];
  return () => queue.shift() ?? 0.5;
};
const ok = [0.5, 0.5, 0.99];
const slow = [0.01, 0.5, 0.99];

const serve = (random: () => number, wait: (ms: number) => Promise<void> = instant) =>
  createPsychrometricsHandlers(apiUrl, { conditions, wait, random });

const server = setupServer();
const apiClient = ky.create({ prefix: apiUrl });

// Site 'a' has readings at 00:00 and 00:05; 'b' has one at 00:00.
const first = reading(20).timestamp;
const pollAfter = (siteId: string, after?: string) => fetchReadingAfter(apiClient, siteId, after);
// For positions that are known to have a reading after them.
const readingAfter = async (siteId: string, after?: string) => {
  const next = await pollAfter(siteId, after);
  if (next === null) throw new Error(`Expected a reading after ${after ?? 'the start'}`);
  return next;
};

describe('psychrometrics handlers, read through the API functions', () => {
  beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
  afterAll(() => server.close());

  it('lists sites without their readings', async () => {
    server.use(...serve(steady));

    const sites = await fetchSites(apiClient);

    expect(sites.map(site => site.id)).toEqual(['a', 'b']);
    expect(sites[0]).not.toHaveProperty('readings');
  });

  it('serves the bundled conditions.json by default, with more than one site', async () => {
    server.use(...createPsychrometricsHandlers(apiUrl));

    expect((await fetchSites(apiClient)).length).toBeGreaterThan(1);
  });

  it('serves one site, and rejects an unknown one', async () => {
    server.use(...serve(steady));

    expect((await fetchSite(apiClient, 'a')).name).toBe('Hall A');
    await expect(fetchSite(apiClient, 'nope')).rejects.toBeInstanceOf(HTTPError);
  });

  it('answers the first reading when no position is given', async () => {
    server.use(...serve(steady));

    expect((await readingAfter('a')).dryBulbC).toBe(20);
  });

  it('answers the reading after the given timestamp, in order', async () => {
    server.use(...serve(steady));

    const one = await readingAfter('a');
    const two = await readingAfter('a', one.timestamp);

    expect(two.dryBulbC).toBe(21);
  });

  it('answers the same reading to the same position, so a call is safe to repeat', async () => {
    server.use(...serve(steady));

    const one = await readingAfter('a', first);
    const again = await readingAfter('a', first);

    expect(again).toEqual(one);
    expect(one.dryBulbC).toBe(21);
  });

  it('answers null after the last reading, and stays ended', async () => {
    server.use(...serve(steady));
    const last = await readingAfter('b');

    expect(await pollAfter('b', last.timestamp)).toBeNull();
    expect(await pollAfter('b', last.timestamp)).toBeNull();
  });

  it('holds no state between sites', async () => {
    server.use(...serve(steady));
    await readingAfter('a', first);

    expect((await readingAfter('b')).dryBulbC).toBe(10);
  });

  it('rejects a failed poll with an error that is not the end of the feed', async () => {
    server.use(...serve(alwaysFail));

    const error = await readingAfter('a').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(HTTPError);
  });

  it('rejects an unknown site and an unparseable position', async () => {
    server.use(...serve(steady));

    await expect(readingAfter('nope')).rejects.toBeInstanceOf(HTTPError);
    await expect(readingAfter('a', 'not-a-date')).rejects.toBeInstanceOf(HTTPError);
  });

  it('answers once on a failure instead of retrying it', async () => {
    let calls = 0;
    server.use(
      http.get(`${apiUrl}/psychrometrics/sites/:siteId/readings`, () => {
        calls += 1;
        return new HttpResponse(null, { status: 503 });
      })
    );

    await readingAfter('a').catch(() => undefined);

    expect(calls).toBe(1);
  });

  it('takes 2 to 3 seconds on a slow call and well under a second otherwise', async () => {
    const wait = vi.fn((_ms: number) => Promise.resolve());
    server.use(...serve(sequence(...slow, ...ok), wait));

    await readingAfter('a');
    await readingAfter('a');

    const [slowMs, normalMs] = wait.mock.calls.map(([ms]) => ms);
    expect(slowMs).toBeGreaterThanOrEqual(2000);
    expect(slowMs).toBeLessThanOrEqual(3000);
    expect(normalMs).toBeLessThan(1000);
  });
});
