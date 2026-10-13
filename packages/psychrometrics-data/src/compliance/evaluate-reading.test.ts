import { describe, expect, it } from 'vitest';
import type { Reading, Site } from '../types/index.js';
import { evaluateReading } from './evaluate-reading.js';

const reading = (dryBulbC: number, rhPct: number): Reading => ({
  timestamp: '2026-08-24T08:00:00Z',
  dryBulbC,
  rhPct
});

const hallA: Site = {
  id: 'a',
  name: 'Hall A',
  envelope: {
    dryBulbMinC: 18,
    dryBulbMaxC: 27,
    dewPointMinC: -9,
    dewPointMaxC: 15,
    rhMaxPct: 60,
    wetBulbMaxC: 18.5
  },
  allowableEnvelope: {
    dryBulbMinC: 15,
    dryBulbMaxC: 32,
    dewPointMinC: -12,
    dewPointMaxC: 17,
    rhMinPct: 8,
    rhMaxPct: 80
  }
};

describe('evaluateReading', () => {
  it('is Recommended inside the envelope', () => {
    const result = evaluateReading(reading(21, 45), hallA);

    expect(result.level).toBe('recommended');
    expect(result.violations).toEqual([]);
  });

  it('treats bounds as inclusive', () => {
    expect(evaluateReading(reading(27, 25), hallA).level).toBe('recommended');
    expect(evaluateReading(reading(21, 60), hallA).level).toBe('recommended');
    expect(evaluateReading(reading(18, 45), hallA).level).toBe('recommended');
  });

  it('is Allowable when only the recommended envelope is broken, and names the bound', () => {
    const result = evaluateReading(reading(27.6, 40), hallA);

    expect(result.level).toBe('allowable');
    expect(result.violations).toEqual([
      { envelope: 'recommended', quantity: 'dryBulb', kind: 'max', limit: 27, value: 27.6 }
    ]);
  });

  it('is Out when the allowable envelope is broken too', () => {
    // 17.6 °C / 12 % has a dew point of about -12.2 °C, below the allowable -12 °C.
    const result = evaluateReading(reading(17.6, 12), hallA);

    expect(result.level).toBe('out');
    const allowable = result.violations.filter(v => v.envelope === 'allowable');
    expect(allowable).toHaveLength(1);
    expect(allowable[0]).toMatchObject({ quantity: 'dewPoint', kind: 'min', limit: -12 });
    expect(allowable[0]?.value).toBeCloseTo(-12.2, 1);
  });

  it('is Out for a site with no allowable envelope as soon as the envelope is broken', () => {
    const site: Site = { id: 'x', name: 'X', envelope: { dryBulbMaxC: 25 } };

    expect(evaluateReading(reading(26, 40), site).level).toBe('out');
    expect(evaluateReading(reading(25, 40), site).level).toBe('recommended');
  });

  it('ignores quantities with no bound', () => {
    const site: Site = { id: 'x', name: 'X', envelope: { dryBulbMinC: 10 } };

    // Hot and very humid, but only a dry-bulb minimum exists.
    expect(evaluateReading(reading(39, 99), site).level).toBe('recommended');
  });

  it('checks wet bulb', () => {
    const result = evaluateReading(reading(26, 60), hallA);

    expect(result.violations.map(v => v.quantity)).toContain('wetBulb');
  });

  describe('near-bound warnings', () => {
    it('warns when a compliant reading is within the margin of a bound', () => {
      const result = evaluateReading(reading(26.5, 30), hallA);

      expect(result.level).toBe('recommended');
      expect(result.warnings).toEqual([
        { quantity: 'dryBulb', kind: 'max', limit: 27, value: 26.5, margin: 1 }
      ]);
    });

    it('uses a 3 % margin for relative humidity', () => {
      const near = evaluateReading(reading(21, 58), hallA);
      const far = evaluateReading(reading(21, 56), hallA);

      expect(near.warnings.map(w => w.quantity)).toContain('relativeHumidity');
      expect(far.warnings.map(w => w.quantity)).not.toContain('relativeHumidity');
    });

    it('warns against the allowable envelope for an Allowable reading', () => {
      const result = evaluateReading(reading(31.5, 40), hallA);

      expect(result.level).toBe('allowable');
      expect(result.warnings.map(w => w.limit)).toContain(32);
    });

    it('gives no warnings for an Out reading', () => {
      expect(evaluateReading(reading(40, 40), hallA).warnings).toEqual([]);
    });
  });
});
