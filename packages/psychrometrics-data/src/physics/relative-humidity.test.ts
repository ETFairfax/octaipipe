import { describe, expect, it } from 'vitest';
import { humidityRatio } from './humidity-ratio.js';
import { relativeHumidity } from './relative-humidity.js';

describe('relativeHumidity', () => {
  it.each([0.1, 0.35, 0.6, 0.95])('round-trips RH %d through humidityRatio', rh => {
    expect(relativeHumidity(22, humidityRatio(22, rh))).toBeCloseTo(rh, 10);
  });

  it('is 1 on the saturation curve', () => {
    expect(relativeHumidity(15, humidityRatio(15, 1))).toBeCloseTo(1, 10);
  });

  it('is 0 for dry air', () => {
    expect(relativeHumidity(15, 0)).toBe(0);
  });
});
