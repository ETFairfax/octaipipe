import { describe, expect, it } from 'vitest';
import type { DerivedReading } from './types.js';
import { violationsOf } from './violations-of.js';

const derived: DerivedReading = {
  timestamp: '2026-08-24T08:00:00Z',
  dryBulbC: 28,
  rhPct: 45,
  humidityRatio: 0.007,
  dewPointC: 8.5,
  wetBulbC: 14
};

describe('violationsOf', () => {
  it('is empty when every bound holds', () => {
    expect(violationsOf(derived, { dryBulbMaxC: 30, rhMinPct: 40 }, 'recommended')).toEqual([]);
  });

  it('reports a broken maximum with the measured value', () => {
    expect(violationsOf(derived, { dryBulbMaxC: 27 }, 'recommended')).toEqual([
      { envelope: 'recommended', quantity: 'dryBulb', kind: 'max', limit: 27, value: 28 }
    ]);
  });

  it('reports a broken minimum', () => {
    expect(violationsOf(derived, { rhMinPct: 50 }, 'allowable')).toEqual([
      { envelope: 'allowable', quantity: 'relativeHumidity', kind: 'min', limit: 50, value: 45 }
    ]);
  });

  it('does not report a value sitting exactly on a limit', () => {
    expect(violationsOf(derived, { dryBulbMaxC: 28, rhMinPct: 45 }, 'recommended')).toEqual([]);
  });

  it('reports every broken bound', () => {
    const result = violationsOf(derived, { dryBulbMaxC: 27, wetBulbMaxC: 13 }, 'recommended');

    expect(result.map(v => v.quantity)).toEqual(['dryBulb', 'wetBulb']);
  });

  it('is empty for an envelope with no bounds', () => {
    expect(violationsOf(derived, {}, 'recommended')).toEqual([]);
  });
});
