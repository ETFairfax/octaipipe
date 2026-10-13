import {
  dewPointFromHumidityRatio,
  humidityRatio,
  type Reading,
  relativeHumidity,
  wetBulb
} from '@workspace/psychrometrics-data';
import { fromGPerKg, toGPerKg } from './chart-domain.js';
import type { ChartScales } from './scales.js';

/** Pixel distance within which the cursor snaps to a trail marker. */
export const snapRadiusPx = 8;

// Dew point is undefined at W = 0, which is the very bottom edge of the plot.
const MIN_W_G_PER_KG = 0.01;

export type HoverTarget = { px: number; py: number } & (
  | { kind: 'reading'; index: number; reading: Reading }
  | { kind: 'above-saturation' }
  | {
      kind: 'point';
      dryBulbC: number;
      /** g/kg */
      w: number;
      rhPct: number;
      dewPointC: number;
      wetBulbC: number;
    }
);

/**
 * What is under the cursor at pixel (px, py): the nearest trail marker within the snap radius,
 * else the state of the air at that point of the chart, else "above saturation" where no air
 * can be.
 */
export const resolveHover = (
  px: number,
  py: number,
  scales: ChartScales,
  trail: Reading[]
): HoverTarget => {
  let nearest: { index: number; distance: number } | undefined;
  trail.forEach((reading, index) => {
    const [mx, my] = scales.toPixel({
      t: reading.dryBulbC,
      w: toGPerKg(humidityRatio(reading.dryBulbC, reading.rhPct / 100))
    });
    const distance = Math.hypot(mx - px, my - py);
    // On a tie the newer marker wins: it is drawn on top.
    if (distance <= snapRadiusPx && (!nearest || distance <= nearest.distance)) {
      nearest = { index, distance };
    }
  });
  const snapped = nearest && trail[nearest.index];
  if (nearest && snapped) {
    return { kind: 'reading', index: nearest.index, reading: snapped, px, py };
  }

  const dryBulbC = scales.x.invert(px);
  const w = Math.max(scales.y.invert(py), MIN_W_G_PER_KG);
  if (w > toGPerKg(humidityRatio(dryBulbC, 1))) return { kind: 'above-saturation', px, py };

  const wKgPerKg = fromGPerKg(w);
  return {
    kind: 'point',
    px,
    py,
    dryBulbC,
    w,
    rhPct: relativeHumidity(dryBulbC, wKgPerKg) * 100,
    dewPointC: dewPointFromHumidityRatio(wKgPerKg),
    wetBulbC: wetBulb(dryBulbC, wKgPerKg)
  };
};
