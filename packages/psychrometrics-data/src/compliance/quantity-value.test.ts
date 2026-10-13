import { describe, expect, it } from 'vitest';
import { quantityValue } from './quantity-value.js';
import type { DerivedReading, Quantity } from './types.js';

const derived: DerivedReading = {
  timestamp: '2026-08-24T08:00:00Z',
  dryBulbC: 21,
  rhPct: 45,
  humidityRatio: 0.007,
  dewPointC: 8.5,
  wetBulbC: 14
};

describe('quantityValue', () => {
  it.each<[Quantity, number]>([
    ['dryBulb', 21],
    ['dewPoint', 8.5],
    ['relativeHumidity', 45],
    ['wetBulb', 14]
  ])('reads %s', (quantity, expected) => {
    expect(quantityValue(derived, quantity)).toBe(expected);
  });
});
