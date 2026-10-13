import { describe, expect, it } from 'vitest';
import { saturationPressure } from './saturation-pressure.js';

describe('saturationPressure', () => {
  it('is the Magnus reference pressure at 0 °C', () => {
    expect(saturationPressure(0)).toBeCloseTo(0.611, 3);
  });

  it('is about 2.34 kPa at 20 °C', () => {
    expect(saturationPressure(20)).toBeCloseTo(2.34, 1);
  });

  it('rises with temperature', () => {
    expect(saturationPressure(25)).toBeGreaterThan(saturationPressure(15));
  });
});
