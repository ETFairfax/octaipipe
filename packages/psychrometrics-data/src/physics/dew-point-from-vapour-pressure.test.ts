import { describe, expect, it } from 'vitest';
import { dewPointFromVapourPressure } from './dew-point-from-vapour-pressure.js';
import { saturationPressure } from './saturation-pressure.js';

describe('dewPointFromVapourPressure', () => {
  it('is 0 °C at the Magnus reference pressure', () => {
    expect(dewPointFromVapourPressure(0.61094)).toBeCloseTo(0, 10);
  });

  it.each([-5, 5, 15, 30])('inverts saturationPressure at %d °C', tC => {
    expect(dewPointFromVapourPressure(saturationPressure(tC))).toBeCloseTo(tC, 8);
  });
});
