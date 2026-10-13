# Plan: Fix isoline labels overhanging the plot edge

Short-lived plan. Delete when built. Do not reference from other docs.

## Problem

The "100% RH" label at the top of the saturation curve pokes out past the plot frame and shows a cut-off glyph after the text. The same mechanism can affect any isoline label near an edge.

## Cause

`IsolineLabel` in `packages/psychrometrics-ui/src/internal/chart/isoline-layer.tsx` places the text `LABEL_INSET_PX` (16 px) back from the exit point, but with `textAnchor='middle'`. At 10 px font "100% RH" is about 45 px wide, so half of it (about 23 px) runs along the line direction past the exit point. The saturation curve exits at the top edge at a steep angle, so the tail of the text lands on or above the frame.

Short labels ("20%", "5°") fit inside the 16 px inset, which is why only the longest label shows it.

## Change

- In `IsolineLabel`, anchor the text by its end rather than its middle (`textAnchor='end'`, then flip back to `start` for the case where the angle flip below rotates the text 180°), so the end of the text sits at the inset point and the whole label is inside the plot regardless of its length. Keep the inset small (about 6 to 8 px) once the anchor changes, otherwise labels sit too far from the edge.
- Keep the existing angle normalisation to between -90° and 90° (the flip is what makes text readable). Because the flip reverses the text direction relative to the line, the anchor must be chosen from which side of the exit the text now runs on, not hard-coded. Work this out with the angle before the flip: if it was normalised, the text runs backwards along the line, so `start` is the end nearest the exit.
- Do not shorten the label text. The brief asks for labelled isolines; "100% RH" stays.

## Verify

- Open the page at `/psychrometrics` and check all four RH labels, all five wet-bulb labels and the saturation label sit fully inside the plot rectangle, and that none is hidden behind another label.
- Add a geometry-level test if the placement is moved into a pure function (for example `labelPlacement(points, scales, textWidth)` returning x, y, angle and anchor). Assert that for every isoline in `relativeHumidityLines()`, `wetBulbLines()` and `saturationCurve()` the label's far end lies inside `scales.plot`. Text width can be an approximation (characters x 5.5 px), since the test guards the geometry, not the font.
- `pnpm --filter @workspace/psychrometrics-ui test`, then `pnpm check && pnpm typecheck`.

## Out of scope

Collision avoidance between labels. The current layout has none and the screenshot shows none.
