import { describe, expect, it } from 'vitest';
import { humidityRatioFromVapourPressure } from './humidity-ratio-from-vapour-pressure.js';
import { vapourPressureFromHumidityRatio } from './vapour-pressure-from-humidity-ratio.js';

describe('humidityRatioFromVapourPressure', () => {
  it('is zero for dry air', () => {
    expect(humidityRatioFromVapourPressure(0)).toBe(0);
  });

  it('is about 14.7 g/kg at 2.3335 kPa', () => {
    expect(humidityRatioFromVapourPressure(2.3335) * 1000).toBeCloseTo(14.66, 1);
  });

  it('inverts vapourPressureFromHumidityRatio', () => {
    const pw = 1.8;

    expect(vapourPressureFromHumidityRatio(humidityRatioFromVapourPressure(pw))).toBeCloseTo(
      pw,
      10
    );
  });
});
