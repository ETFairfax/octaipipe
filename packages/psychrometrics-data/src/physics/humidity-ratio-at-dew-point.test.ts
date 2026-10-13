import { describe, expect, it } from 'vitest';
import { dewPointFromHumidityRatio } from './dew-point-from-humidity-ratio.js';
import { humidityRatio } from './humidity-ratio.js';
import { humidityRatioAtDewPoint } from './humidity-ratio-at-dew-point.js';

describe('humidityRatioAtDewPoint', () => {
  it('is the humidity ratio of saturated air at that temperature', () => {
    expect(humidityRatioAtDewPoint(10)).toBeCloseTo(humidityRatio(10, 1), 12);
  });

  it('round-trips through dewPointFromHumidityRatio', () => {
    expect(dewPointFromHumidityRatio(humidityRatioAtDewPoint(12))).toBeCloseTo(12, 8);
  });
});
