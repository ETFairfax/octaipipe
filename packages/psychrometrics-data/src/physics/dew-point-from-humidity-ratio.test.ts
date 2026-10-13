import { describe, expect, it } from 'vitest';
import { dewPointFromHumidityRatio } from './dew-point-from-humidity-ratio.js';
import { humidityRatio } from './humidity-ratio.js';

describe('dewPointFromHumidityRatio', () => {
  it.each([
    { dryBulbC: 25, rh: 0.5, dewPointC: 13.86 },
    { dryBulbC: 20, rh: 0.6, dewPointC: 12.0 },
    { dryBulbC: 30, rh: 0.3, dewPointC: 10.54 },
    { dryBulbC: 18, rh: 0.6, dewPointC: 10.12 }
  ])('matches the reference at $dryBulbC °C / $rh', ({ dryBulbC, rh, dewPointC }) => {
    expect(dewPointFromHumidityRatio(humidityRatio(dryBulbC, rh))).toBeCloseTo(dewPointC, 1);
  });

  it('equals the dry bulb on the saturation curve', () => {
    expect(dewPointFromHumidityRatio(humidityRatio(18, 1))).toBeCloseTo(18, 8);
  });
});
