import { describe, expect, it } from 'vitest';
import { humidityRatio } from './humidity-ratio.js';

describe('humidityRatio', () => {
  it.each([
    { dryBulbC: 25, rh: 0.5, wGPerKg: 9.86 },
    { dryBulbC: 20, rh: 0.6, wGPerKg: 8.71 },
    { dryBulbC: 30, rh: 0.3, wGPerKg: 7.9 },
    { dryBulbC: 18, rh: 0.6, wGPerKg: 7.68 }
  ])('matches the reference at $dryBulbC °C / $rh', ({ dryBulbC, rh, wGPerKg }) => {
    expect(humidityRatio(dryBulbC, rh) * 1000).toBeCloseTo(wGPerKg, 1);
  });

  it('is zero at 0 % relative humidity', () => {
    expect(humidityRatio(22, 0)).toBe(0);
  });

  it('scales with relative humidity at a fixed dry bulb', () => {
    expect(humidityRatio(22, 0.8)).toBeGreaterThan(humidityRatio(22, 0.4));
  });
});
