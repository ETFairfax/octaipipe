import { describe, expect, it } from 'vitest';
import { dewPointFromHumidityRatio } from '../physics/dew-point-from-humidity-ratio.js';
import { humidityRatio } from '../physics/humidity-ratio.js';
import { wetBulb } from '../physics/wet-bulb.js';
import { deriveReading } from './derive-reading.js';

const reading = { timestamp: '2026-08-24T08:00:00Z', dryBulbC: 22, rhPct: 50 };

describe('deriveReading', () => {
  it('keeps the original reading fields', () => {
    expect(deriveReading(reading)).toMatchObject(reading);
  });

  it('derives humidity ratio from dry bulb and RH as a fraction', () => {
    expect(deriveReading(reading).humidityRatio).toBe(humidityRatio(22, 0.5));
  });

  it('derives dew point and wet bulb from the humidity ratio', () => {
    const derived = deriveReading(reading);

    expect(derived.dewPointC).toBe(dewPointFromHumidityRatio(derived.humidityRatio));
    expect(derived.wetBulbC).toBe(wetBulb(22, derived.humidityRatio));
  });

  it('orders dew point below wet bulb below dry bulb for unsaturated air', () => {
    const derived = deriveReading(reading);

    expect(derived.dewPointC).toBeLessThan(derived.wetBulbC);
    expect(derived.wetBulbC).toBeLessThan(derived.dryBulbC);
  });

  it('collapses all three temperatures at saturation', () => {
    const derived = deriveReading({ ...reading, rhPct: 100 });

    expect(derived.dewPointC).toBeCloseTo(22, 1);
    expect(derived.wetBulbC).toBeCloseTo(22, 1);
  });
});
