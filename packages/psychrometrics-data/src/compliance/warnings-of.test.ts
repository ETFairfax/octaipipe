import { describe, expect, it } from 'vitest';
import type { DerivedReading } from './types.js';
import { warningsOf } from './warnings-of.js';

const derived: DerivedReading = {
  timestamp: '2026-08-24T08:00:00Z',
  dryBulbC: 26.5,
  rhPct: 45,
  humidityRatio: 0.007,
  dewPointC: 8.5,
  wetBulbC: 14
};

describe('warningsOf', () => {
  it('is empty when every bound is further away than its margin', () => {
    expect(warningsOf(derived, { dryBulbMaxC: 30, rhMinPct: 30 })).toEqual([]);
  });

  it('warns within the margin of a maximum, with the value and margin', () => {
    expect(warningsOf(derived, { dryBulbMaxC: 27 })).toEqual([
      { quantity: 'dryBulb', kind: 'max', limit: 27, value: 26.5, margin: 1 }
    ]);
  });

  it('warns within the margin of a minimum', () => {
    expect(warningsOf(derived, { dryBulbMinC: 26 })).toHaveLength(1);
  });

  it('includes a value exactly one margin away', () => {
    expect(warningsOf(derived, { dryBulbMaxC: 27.5 })).toHaveLength(1);
    expect(warningsOf(derived, { dryBulbMaxC: 27.6 })).toEqual([]);
  });

  it('uses the per-quantity margin, 3 % for relative humidity', () => {
    expect(warningsOf(derived, { rhMinPct: 42 })).toHaveLength(1);
    expect(warningsOf(derived, { rhMinPct: 41.9 })).toEqual([]);
  });

  it('also warns about a bound that is already broken', () => {
    expect(warningsOf(derived, { dryBulbMaxC: 26 })).toHaveLength(1);
  });
});
