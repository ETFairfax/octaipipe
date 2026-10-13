import { describe, expect, it } from 'vitest';
import { dewPointFromHumidityRatio } from './dew-point-from-humidity-ratio.js';
import { humidityRatio } from './humidity-ratio.js';
import { humidityRatioAtWetBulb } from './humidity-ratio-at-wet-bulb.js';
import { wetBulb } from './wet-bulb.js';

describe('wetBulb', () => {
  it.each([
    { dryBulbC: 25, rh: 0.5, wetBulbC: 17.89 },
    { dryBulbC: 20, rh: 0.6, wetBulbC: 15.14 },
    { dryBulbC: 30, rh: 0.3, wetBulbC: 17.98 },
    { dryBulbC: 18, rh: 0.6, wetBulbC: 13.41 }
  ])('matches the reference at $dryBulbC °C / $rh', ({ dryBulbC, rh, wetBulbC }) => {
    expect(wetBulb(dryBulbC, humidityRatio(dryBulbC, rh))).toBeCloseTo(wetBulbC, 1);
  });

  it('equals the dry bulb on the saturation curve', () => {
    expect(wetBulb(18, humidityRatio(18, 1))).toBeCloseTo(18, 1);
  });

  it('lies between the dew point and the dry bulb', () => {
    const w = humidityRatio(27, 0.4);
    const result = wetBulb(27, w);

    expect(result).toBeGreaterThan(dewPointFromHumidityRatio(w));
    expect(result).toBeLessThan(27);
  });

  it('is the temperature whose wet-bulb isoline passes through the point', () => {
    const w = humidityRatio(27, 0.4);

    expect(humidityRatioAtWetBulb(27, wetBulb(27, w))).toBeCloseTo(w, 4);
  });
});
