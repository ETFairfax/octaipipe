import { describe, expect, it } from 'vitest';
import { evaluateReading } from '../compliance/evaluate-reading.js';
import { psychrometricsFixtures } from './index.js';

const [hallA, hallB] = psychrometricsFixtures.sites;

const evaluate = (site: NonNullable<typeof hallA>, timestampTime: string) => {
  const reading = site.readings.find(r => r.timestamp.includes(`T${timestampTime}`));
  if (!reading) throw new Error(`No reading at ${timestampTime}`);
  return evaluateReading(reading, site);
};

describe('Hall A readings', () => {
  it('has the hand-calculated levels', () => {
    if (!hallA) throw new Error('Hall A missing');

    expect(evaluate(hallA, '08:25').level).toBe('allowable'); // RH 63 %
    expect(evaluate(hallA, '09:15').level).toBe('allowable'); // 27.6 °C
    expect(evaluate(hallA, '10:25').level).toBe('out'); // dew point about -12.2 °C
  });

  it('breaks the recommended dew-point minimum at 10:25 and 10:30', () => {
    if (!hallA) throw new Error('Hall A missing');

    for (const time of ['10:25', '10:30']) {
      const violations = evaluate(hallA, time).violations;
      expect(violations.some(v => v.quantity === 'dewPoint' && v.envelope === 'recommended')).toBe(
        true
      );
    }
  });

  it('shows all three levels over the run', () => {
    if (!hallA) throw new Error('Hall A missing');

    const levels = new Set(hallA.readings.map(r => evaluateReading(r, hallA).level));
    expect([...levels].sort()).toEqual(['allowable', 'out', 'recommended']);
  });
});

describe('Hall B', () => {
  it('has bounds Hall A lacks and omits ones Hall A has', () => {
    if (!hallA || !hallB) throw new Error('Fixture sites missing');

    expect(hallB.envelope.wetBulbMinC).toBeDefined();
    expect(hallA.envelope.wetBulbMinC).toBeUndefined();
    expect(hallB.envelope.rhMinPct).toBeDefined();
    expect(hallA.envelope.rhMinPct).toBeUndefined();
    expect(hallB.envelope.dewPointMaxC).toBeUndefined();
    expect(hallA.envelope.dewPointMaxC).toBeDefined();
  });

  it('has readings that cross the wet-bulb minimum and the RH minimum, and all three levels', () => {
    if (!hallB) throw new Error('Hall B missing');

    const results = hallB.readings.map(r => evaluateReading(r, hallB));
    const broken = results.flatMap(result => result.violations.map(v => v.quantity));

    expect(broken).toContain('wetBulb');
    expect(broken).toContain('relativeHumidity');
    expect(new Set(results.map(r => r.level))).toEqual(
      new Set(['recommended', 'allowable', 'out'])
    );
  });
});
