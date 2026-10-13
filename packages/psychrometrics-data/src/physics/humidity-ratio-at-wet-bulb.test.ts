import { describe, expect, it } from 'vitest';
import { humidityRatio } from './humidity-ratio.js';
import { humidityRatioAtWetBulb } from './humidity-ratio-at-wet-bulb.js';

describe('humidityRatioAtWetBulb', () => {
  it('meets the saturation curve where dry bulb equals wet bulb', () => {
    expect(humidityRatioAtWetBulb(18, 18)).toBeCloseTo(humidityRatio(18, 1), 10);
  });

  it('falls as dry bulb rises along the isoline', () => {
    expect(humidityRatioAtWetBulb(30, 18)).toBeLessThan(humidityRatioAtWetBulb(22, 18));
  });

  it('passes through the 25 °C / 50 % reference at its 17.89 °C wet bulb', () => {
    expect(humidityRatioAtWetBulb(25, 17.89) * 1000).toBeCloseTo(9.86, 1);
  });
});
