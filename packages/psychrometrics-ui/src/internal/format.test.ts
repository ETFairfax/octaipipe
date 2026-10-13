import { describe, expect, it } from 'vitest';
import { describeWarning, formatAge, formatTimestamp, worstEnvelopes } from './format.js';

describe('format', () => {
  it('reports the allowable envelope when both envelopes of one quantity are broken', () => {
    const worst = worstEnvelopes([
      { envelope: 'recommended', quantity: 'dryBulb', kind: 'min', limit: 20, value: 17.2 },
      { envelope: 'recommended', quantity: 'wetBulb', kind: 'min', limit: 12, value: 10.8 },
      { envelope: 'allowable', quantity: 'dryBulb', kind: 'min', limit: 18, value: 17.2 }
    ]);
    expect(worst.get('dryBulb')).toBe('allowable');
    expect(worst.get('wetBulb')).toBe('recommended');
    expect(worst.get('dewPoint')).toBeUndefined();
  });

  it('describes a near-bound warning', () => {
    expect(
      describeWarning({ quantity: 'dryBulb', kind: 'max', limit: 27, value: 26.5, margin: 1 })
    ).toBe('Dry bulb 26.5 °C is within 1 °C of max 27 °C');
  });

  it('formats timestamps as UTC and ages in seconds', () => {
    expect(formatTimestamp('2026-08-24T08:25:00Z')).toBe('2026-08-24 08:25 UTC');
    expect(formatAge(12_340)).toBe('12.3 s');
  });
});
