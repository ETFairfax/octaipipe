# Plan: Dew-point axis label spacing

Short-lived plan. Delete when built. Do not reference from other docs.

## Problem

On the right-hand dew-point axis the labels -5 and -10 look tight against each other and against 0.

## What the numbers say

Ticks sit at W(p_ws(T_dp)), so the gaps shrink towards the bottom. On the 860 x 560 layout (plot height 492 px for 25 g/kg, about 19.7 px per g/kg):

| Tick | W (g/kg) | Gap to the next tick |
|---|---|---|
| 0 | 3.78 | 1.3 g/kg, about 26 px |
| -5 | 2.47 | 0.9 g/kg, about 17 px |
| -10 | 1.60 | |

Labels are 11 px text, so they do not overlap. 17 px between baselines is the tightest pair. This is a property of the physics, not a layout bug, and the brief mandates ticks at -10, -5, 0 ... 20.

## Decision

Do not thin or drop ticks. The brief fixes the tick set. Make two small changes, then stop:

1. Render negative values with a true minus sign (U+2212) instead of a hyphen-minus. It reads as a number, is visibly wider, and separates "-10" from the tick line. Change only the displayed text in `packages/psychrometrics-ui/src/internal/chart/axes-layer.tsx` (the `{dewPointC}` child). Keep `data-axis='dew-point'` text matching what the test asserts, so update the expectation in `packages/psychrometrics-ui/src/widgets/psychrometric-chart.test.tsx` ("labels the dew-point axis from -10 to 20 °C") to use the same glyph.
2. Check the ticks and labels do not collide with the "Dew point (°C)" title at `plot.right + 52`. Labels start at `plot.right + 9`; a three-character label at 11 px is about 25 px wide, so there is room. No change expected.

## If it still looks cramped

Increase `defaultLayout.height` in `packages/psychrometrics-ui/src/internal/geometry/scales.ts` (for example 560 to 600). This widens every gap proportionally and is a one-line change. Prefer it over per-label offsets.

## Verify

Open `/psychrometrics`, zoom the browser to 100 %, and confirm -10, -5, 0 read cleanly. Run `pnpm --filter @workspace/psychrometrics-ui test`.
