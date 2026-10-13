# Plan: Psychrometric SLA chart

Short-lived plan. Delete when built. Do not reference from other docs.

Source requirements: `docs/plans/OctaiPipe Take Home Assessment 2 - Psychrometric Chart.pdf` (read it first; the physics formulas and reference values are in it).
Glossary: `packages/psychrometrics-data/CONTEXT.md` (already written; keep terms consistent).
Architecture: `docs/frontend-architecture.md`, `docs/agents/code-conventions.md`. Copy the layout of `packages/asset-data` and `packages/asset` (package.json, turbo.json tags `type:data` / `type:ui`, tsconfig, vitest config, `exports` only `src/index.ts`, plus `./mocks` on the data package).

## Decisions already made (do not re-litigate)

1. **Placement**: two new domain packages `psychrometrics-data` and `psychrometrics-ui`, plus one thin route in `apps/platform`. 
2. **No JSON:API.** `conditions.json` is not JSON:API and stays as is. Validate with plain zod schemas on the file's own shape. This deliberately deviates from the architecture doc; say so in the data package README.
3. **Polling**: TanStack Query, `refetchInterval: 1000`, retries off per query (check the shared `QueryClient` defaults and override), queryFn calls `nextReading`.
4. **Feed end**: stop in an `ended` state (no wrap-around, because wrapping would show replayed history as live). A Replay button resets the cursor.
5. **Staleness** is wall-clock time since the last successful fetch, not reading timestamps. Stale = last poll failed OR no new reading for >= 2.5 s. Stale keeps the last reading and trail visible but dimmed, with a banner and a ticking age counter. A stale reading is never shown as a fresh compliant one. Recovery is automatic on the next success. A rejected `nextReading` does not advance the cursor.
6. **Safe zone**: for each dry-bulb T in the chart range, floor(T) = max of all lower bounds, ceiling(T) = min of all upper bounds, expressed as humidity ratio W; keep T where floor < ceiling; polygon = ceiling points forward then floor points backward. Insert exact curve crossings (bisection) so corners are sharp. Absent keys contribute nothing (floor falls back to W = 0, ceiling to saturation). Nothing hard-coded to the current numbers. Same builder is used for the envelope and the allowable envelope.
7. **Compliance**: three levels Recommended / Allowable / Out, bounds inclusive, each Violation names quantity, limit and value, plus Near-Bound Warnings. Margins as constants: 1 °C dry bulb / dew point / wet bulb, 3 % RH.
8. **Rendering**: SVG with `d3-scale` linear scales only. Hand-built path strings. No chart library. Semantic colour tokens from `@workspace/ui`, no hex.
9. **Chart is data-agnostic**: `PsychrometricChart` takes plain props (site/envelopes, readings/trail, feed state info) and knows nothing about polling or the feed.
10. **Second site**: add "Hall B" to the fixture with different bounds and different missing keys (e.g. a wet-bulb minimum, no dew-point maximum) and its own readings. Purpose: prove the zone builder, compliance and chart are data driven, so Hall B should exercise bounds Hall A lacks (a wet-bulb minimum, an RH minimum) and omit ones Hall A has, with readings that cross at least one of those bounds. `getSite(siteId)` / `nextReading(siteId)` with a separate cursor per site. Site chosen by `?site=` search param (schema file outside `routes/`, `.catch(undefined)`, default first site). Selector shown only when more than one site.
11. **Hover**: one overlay rect; inverse scales give (T, W); derive RH, dew point, wet bulb with the physics functions. Within ~8 px of a trail marker, snap to that reading (values + timestamp) and highlight it. Above the saturation curve the tooltip says "above saturation" instead of numbers. Thin crosshair follows the cursor.

## Build order

Work test-first (`tdd` skill) for steps 2 to 4.

### 1. Scaffold
- Move `docs/conditions.json` to `packages/psychrometrics-data/src/mocks/conditions.json` (the `docs/` copy is a drop-off, not the source).
- Create `packages/psychrometrics-data` and `packages/psychrometrics-ui` from the asset packages. Add to workspace deps of `apps/platform`, turbo tags, CODEOWNERS entries. Add `d3-scale` (+ types) to the UI package.
- Add the domain to the table in `docs/frontend-architecture.md` section 3 (decide base vs composite: it is a base domain; nothing else embeds it).
- Follow "Adding a new domain" in `docs/frontend-architecture.md` section 12 in full and add the nav item.
- Add `packages/psychrometrics-ui/CONTEXT.md` (UI vocabulary: zone, isoline, trail marker, tooltip modes, status banner) and its entry in `CONTEXT-MAP.md`. `packages/psychrometrics-data/CONTEXT.md` and its map entry already exist.
- Confirm `pnpm boundaries`, `pnpm lint:imports`, `pnpm typecheck` pass on the empty packages.

### 2. Physics (`psychrometrics-data`, pure functions, no React)
Constants: P = 101.325 kPa. Functions: saturation vapour pressure, vapour pressure from RH, humidity ratio from (T, RH), dew point from vapour pressure, vapour pressure from W, RH from (T, W), wet bulb from (T, W or RH) by bisection between dew point and dry bulb to 0.01 °C using the ASHRAE relation given in the PDF (not Stull). Also: W of an RH isoline at T, W of a wet-bulb isoline at T, W at a dew point (horizontal line), and dew point to W for the right-hand axis.
Units: temperatures °C, RH as a fraction internally (file is percent; convert at the boundary only), W kg/kg internally, show g/kg.

### 3. Domain types, feed and compliance (`psychrometrics-data`)
- zod schemas and inferred types: `Site`, `Envelope` (optional keys: dryBulbMinC/MaxC, dewPointMinC/MaxC, rhMinPct/MaxPct, wetBulbMinC/MaxC, `label`), `AllowableEnvelope`, `Reading` `{ timestamp, dryBulbC, rhPct }`. Export types, not schemas.
- Feed interface: `getSite(siteId)`, `nextReading(siteId)`, plus a way to reset a site's cursor. Mock implementation behind the interface, reading `conditions.json`: short random delay, 2 to 3 s roughly every 10th call, rejects roughly every 15th, takes an injectable random function for tests. Rejection does not advance the cursor. Feed end is a distinct, typed condition (not a generic error).
- Query keys, `getSiteOptions`, `nextReading` query options (retry off, 1 s interval), hooks. Hook accumulates the trail via a pure reducer: current + previous 6, `ended`, `stale` flag, last-success time, replay.
- Compliance: `evaluateReading(reading, site)` returns level, violations, near-bound warnings. Works from whatever bounds are present.

### 4. Geometry (`psychrometrics-ui/src/internal`, pure)
- Scales: x = dry bulb 10 to 40 °C, y = humidity ratio 0 to 25 g/kg, plus the dew-point right axis (ticks -10, -5, 0 ... 20 °C placed at W(p_ws(Tdp))).
- Isolines sampled finely and clipped to the plot: saturation curve (100 % RH) with the region above shaded grey; RH curves 20/40/60/80 %; wet-bulb lines 5/10/15/20/25 °C. Label each where it exits the plot.
- Zone builder (decision 6). Returns a closed polygon; handles empty/degenerate zones without throwing.

### 5. Chart and page (`psychrometrics-ui`)
- Layers as separate components: axes + grid, isolines, saturation shading, zones (allowable outer, recommended inner), trail + current point, hover overlay + tooltip.
- Trail markers fade with age; the current point is coloured by compliance level.
- Compliance panel: level badge, list of violated bounds (e.g. "Dry bulb 28.2 °C > max 27 °C"), near-bound warnings.
- Feed status UI: loading skeleton on first load, "slow" indicator while a call exceeds ~1.5 s (agent's default, not discussed with the user; adjust freely), error/stale banner with age, ended banner with Replay.
- Page `PsychrometricsPage` wires the hooks to the chart; site selector.
- Public API only through each package's `index.ts`.

### 6. Route
`apps/platform/src/routes/.../psychrometrics.tsx`, thin: validates `?site=` (schema and URL mapping in a file outside `routes/`, unit tested like the asset list URL), renders the page. Add a nav item.

### 7. Tests (next to the code)
1. Physics against the four reference rows in the PDF (dew point, wet bulb, W) and an RH to W to RH round trip.
2. Compliance: inclusive edges (27.0 °C passes), all three levels, named violations, absent keys ignored, near-bound warnings.
3. Zone polygon agrees with compliance: over a grid of points, inside the polygon iff the check says Recommended (and iff not Out for the allowable zone). Run for both sites.
4. Feed reducer: trail cap, ended, fail marks stale without dropping the reading, recovery.
5. Mock feed: failure does not advance the cursor (injected random).
6. Chart smoke test: key layers render; stale status shows the banner. Plus the `?site=` URL mapping test.

### 8. README
Repo-root or package README covering what the brief asks: how to run the app and tests; key decisions and trade-offs (including the safe-zone derivation, feed-end choice, staleness definition, JSON:API deviation); how to add a second site (append an object to `conditions.json`, no code change); where AI assistants were used and what was rejected or reworked (be honest, fill in as it happens); what was cut and what next.

## Acceptance checks
- Fixture readings show all three levels over the run. Expected by hand calculation (verify in code): 08:25 RH 63 % and 09:15 dry bulb 27.6 °C are Allowable; 10:25 (17.6 °C, 12 % RH, dew point about -12.2 °C, below the allowable -12 °C) is Out; the low-RH readings around 10:20 to 10:30 also break the recommended dew-point minimum of -9 °C.
- Editing a number in `conditions.json` (or adding Hall B) changes the shaded zone with no code change.
- Throttling or failing the feed visibly dims the point and shows the banner; recovery is automatic.
- `pnpm check`, `boundaries`, `lint:imports`, `typecheck`, `test` all pass.

## Not doing
Responsive layout, accessibility beyond sensible semantics, styling frameworks, persistence, a backend, real auth wiring, git commits unless asked (commits need a GitHub issue number per `docs/git-workflow.md`).
