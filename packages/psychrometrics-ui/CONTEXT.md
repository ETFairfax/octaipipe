# Psychrometrics

The UI half of the Psychrometrics domain: the psychrometric chart and the live page around it.
Reads data through `@workspace/psychrometrics-data`; glossary terms (Site, Reading, Envelope,
Compliance Level, Feed State, Trail) are defined there and used here unchanged. See
`docs/frontend-architecture.md`.

## Language

**Chart**:
`PsychrometricChart`. Draws what it is given (envelopes, a Trail, a level, a stale flag) and knows
nothing about polling or the Feed, so it can be embedded and tested with plain props.

**Page**:
`PsychrometricsPage`. Wires the Feed hooks to the Chart, the compliance panel and the status
banner. The route owns the URL (which site is selected); the page never touches the router.

**Layer**:
One concern of the Chart drawn as its own SVG group: axes, isolines, saturation shade, zones, trail,
hover. Layers take scales and plain data; none reads another's state.

**Isoline**:
A line of constant relative humidity or wet bulb, clipped to the plot and labelled where it exits.
The saturation curve is the 100 % RH isoline. Dew point has no isoline: it is horizontal, so it
is shown as the right-hand axis instead.

**Zone**:
The shaded region of the chart that satisfies an Envelope. The Allowable Envelope's zone is the
outer one, the Envelope's the inner. Derived from whatever bounds are present, never hard-coded
(see `buildZone`). A zone can be several polygons or none.

**Trail marker**:
A past Reading on the chart, fading with age. The newest marker is the **current point**,
coloured by Compliance Level.

**Tooltip modes**:
Hover shows one of three things: a **reading** (snapped to a trail marker, with its timestamp), the
**air state** at the cursor (dry bulb, humidity ratio, dew point, RH, wet bulb), or **above
saturation** where no air can exist and no numbers are shown.

**Status banner**:
The message above the chart when the Feed State is not Live: stale (with a ticking age), ended (with
Replay) or a slow poll. Live shows no banner, so any banner is a reason to doubt the reading. A
stale reading is dimmed and its level is shown as "last known", never as current.

## Rendering

Plain SVG with `d3-scale` linear scales only; no chart library. Geometry works in data
coordinates (°C, g/kg) and is converted to pixels at the last step, so it is unit-testable
without a DOM. Colours are semantic tokens from `@workspace/ui` (`success`, `warning`,
`destructive`, `primary`, `muted-foreground`), never hex.
