# @workspace/psychrometrics-data

Data layer for the Psychrometrics domain: the site feed, humid-air physics, compliance rules and
the polling hooks. Only `src/index.ts` is importable. Terms are in [`CONTEXT.md`](./CONTEXT.md).

## Deliberate deviations from the architecture doc

- **No JSON:API.** `conditions.json` is a plain file, not a JSON:API document, so `src/types/site.ts`
  validates its own shape with zod and the domain types are inferred from that. There is no
  `{ id, type, attributes }` wrapper.
- **The feed is polled over HTTP, and the client owns its position.** The query hooks call the
  functions in `src/api`, which hit `psychrometrics/sites`, `psychrometrics/sites/:siteId` and
  `GET .../:siteId/readings?after=<timestamp>` on the shared API client. The last reading the
  client has is the cursor; the answer is the first reading after it, or the first reading when
  `after` is omitted, and `ended: true` once there is none. A network failure or non-2xx is a
  failed poll, and since nothing is consumed server-side, a retry just asks again. There is no
  backend yet, so `pnpm dev:mock` answers those routes from `./mocks`
  (`createPsychrometricsHandlers`), an MSW implementation that reads `conditions.json` and holds the
  delays and slow and failing polls. Tests register the same handlers, with injected `random`
  and `wait`. `./mocks` is dev and test only, so msw stays out of the bundle.

## Tests

```sh
pnpm --filter @workspace/psychrometrics-data test
```
