import { humidityRatio, type Reading } from '@workspace/psychrometrics-data';
import { describe, expect, it } from 'vitest';
import { toGPerKg } from './chart-domain.js';
import { resolveHover, snapRadiusPx } from './hover.js';
import { createScales } from './scales.js';

const scales = createScales();
const reading: Reading = { timestamp: '2026-08-24T08:00:00Z', dryBulbC: 25, rhPct: 50 };
const [markerX, markerY] = scales.toPixel({
  t: 25,
  w: toGPerKg(humidityRatio(25, 0.5))
});

describe('resolveHover', () => {
  it('reads the air state at the cursor, matching the brief reference row', () => {
    const target = resolveHover(markerX, markerY, scales, []);

    expect(target.kind).toBe('point');
    if (target.kind !== 'point') return;
    expect(target.dryBulbC).toBeCloseTo(25, 6);
    expect(target.w).toBeCloseTo(9.86, 1);
    expect(target.rhPct).toBeCloseTo(50, 3);
    expect(target.dewPointC).toBeCloseTo(13.86, 1);
    expect(target.wetBulbC).toBeCloseTo(17.89, 1);
  });

  it('snaps to a trail marker within the snap radius', () => {
    const target = resolveHover(markerX + snapRadiusPx - 1, markerY, scales, [reading]);

    expect(target).toMatchObject({ kind: 'reading', index: 0, reading });
  });

  it('does not snap beyond the snap radius', () => {
    const target = resolveHover(markerX + snapRadiusPx + 2, markerY, scales, [reading]);

    expect(target.kind).toBe('point');
  });

  it('snaps to the nearest of two markers', () => {
    const other: Reading = { ...reading, timestamp: '2026-08-24T08:05:00Z', dryBulbC: 25.2 };
    const target = resolveHover(markerX + 1, markerY, scales, [other, reading]);

    expect(target).toMatchObject({ kind: 'reading', index: 1 });
  });

  it('says "above saturation" over the shaded region instead of reporting numbers', () => {
    const [x, y] = scales.toPixel({ t: 15, w: 20 });

    expect(resolveHover(x, y, scales, []).kind).toBe('above-saturation');
  });

  it('copes with the bottom edge of the plot', () => {
    const target = resolveHover(markerX, scales.plot.bottom, scales, []);

    expect(target.kind).toBe('point');
    if (target.kind === 'point') expect(Number.isFinite(target.dewPointC)).toBe(true);
  });
});
