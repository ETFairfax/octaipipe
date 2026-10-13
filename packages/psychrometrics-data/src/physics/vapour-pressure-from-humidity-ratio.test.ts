import { describe, expect, it } from 'vitest';
import { vapourPressureFromHumidityRatio } from './vapour-pressure-from-humidity-ratio.js';

describe('vapourPressureFromHumidityRatio', () => {
  it('is zero for dry air', () => {
    expect(vapourPressureFromHumidityRatio(0)).toBe(0);
  });

  it('is about 1.6 kPa at 10 g/kg', () => {
    expect(vapourPressureFromHumidityRatio(0.01)).toBeCloseTo(1.6, 1);
  });

  it('rises with humidity ratio', () => {
    expect(vapourPressureFromHumidityRatio(0.012)).toBeGreaterThan(
      vapourPressureFromHumidityRatio(0.008)
    );
  });
});
