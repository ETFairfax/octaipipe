import { HttpResponse, http } from 'msw';
import { type ConditionsFile, ConditionsFileSchema, type Site } from '../types/index.js';
import conditionsJson from './conditions.json';

const NORMAL_DELAY_MS = [50, 300] as const;
const SLOW_DELAY_MS = [2000, 3000] as const;
const SLOW_CALL_RATE = 1 / 10;
const FAILURE_RATE = 1 / 15;

type HandlerOptions = {
  /** The sites and readings answered with. Defaults to the bundled `conditions.json`. */
  conditions?: ConditionsFile;
  /** Returns a number in [0, 1). Injected by tests to make slow and failing polls deterministic. */
  random?: () => number;
  wait?: (ms: number) => Promise<void>;
};

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const between = ([low, high]: readonly [number, number], random: number) =>
  low + random * (high - low);

const notFound = () => new HttpResponse(null, { status: 404 });

const toSite = ({ readings: _readings, ...site }: ConditionsFile['sites'][number]): Site => site;

/**
 * The psychrometrics API for `dev:mock` and tests, answered from `conditions.json`. Owns the
 * behaviour a real backend would: delays, and slow and failing polls. It keeps no per-client
 * state: the caller says where it is with `after`. Statuses: 404 unknown site, 400 bad `after`,
 * 503 failed poll. `apiUrl` is the base URL answered.
 *
 * Each poll draws from `random` in a fixed order: slow?, delay, fail?.
 */
export const createPsychrometricsHandlers = (
  apiUrl: string,
  {
    conditions = ConditionsFileSchema.parse(conditionsJson),
    random = Math.random,
    wait = sleep
  }: HandlerOptions = {}
) => {
  const findSite = (siteId: string) => conditions.sites.find(site => site.id === siteId);

  return [
    http.get(`${apiUrl}/psychrometrics/sites`, () =>
      HttpResponse.json(conditions.sites.map(toSite))
    ),
    http.get(`${apiUrl}/psychrometrics/sites/:siteId`, async ({ params }) => {
      const site = findSite(String(params.siteId));
      if (!site) return notFound();
      await wait(between(NORMAL_DELAY_MS, random()));
      return HttpResponse.json(toSite(site));
    }),
    http.get(`${apiUrl}/psychrometrics/sites/:siteId/readings`, async ({ params, request }) => {
      const site = findSite(String(params.siteId));
      if (!site) return notFound();

      const afterParam = new URL(request.url).searchParams.get('after');
      const afterMs = afterParam === null ? Number.NEGATIVE_INFINITY : Date.parse(afterParam);
      if (Number.isNaN(afterMs)) return new HttpResponse(null, { status: 400 });

      const slow = random() < SLOW_CALL_RATE;
      await wait(between(slow ? SLOW_DELAY_MS : NORMAL_DELAY_MS, random()));
      if (random() < FAILURE_RATE) return new HttpResponse(null, { status: 503 });

      const reading = site.readings.find(candidate => Date.parse(candidate.timestamp) > afterMs);
      return HttpResponse.json({ reading: reading ?? null, ended: reading === undefined });
    })
  ];
};
