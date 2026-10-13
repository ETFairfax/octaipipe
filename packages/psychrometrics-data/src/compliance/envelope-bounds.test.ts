import { describe, expect, it } from 'vitest';
import { envelopeBounds } from './envelope-bounds.js';

describe('envelopeBounds', () => {
  it('yields one bound per present key and ignores absent ones', () => {
    expect(envelopeBounds({ dryBulbMaxC: 27, rhMinPct: 20 })).toStrictEqual([
      { quantity: 'dryBulb', kind: 'max', limit: 27 },
      { quantity: 'relativeHumidity', kind: 'min', limit: 20 }
    ]);
  });

  it('is empty for an envelope with no bounds', () => {
    expect(envelopeBounds({ label: 'open' })).toStrictEqual([]);
  });

  it('keeps a limit of zero', () => {
    expect(envelopeBounds({ dewPointMinC: 0 })).toEqual([
      { quantity: 'dewPoint', kind: 'min', limit: 0 }
    ]);
  });

  it('maps every key to its quantity and kind', () => {
    const bounds = envelopeBounds({
      dryBulbMinC: 1,
      dryBulbMaxC: 2,
      dewPointMinC: 3,
      dewPointMaxC: 4,
      rhMinPct: 5,
      rhMaxPct: 6,
      wetBulbMinC: 7,
      wetBulbMaxC: 8
    });

    expect(bounds).toStrictEqual([
      { quantity: 'dryBulb', kind: 'min', limit: 1 },
      { quantity: 'dryBulb', kind: 'max', limit: 2 },
      { quantity: 'dewPoint', kind: 'min', limit: 3 },
      { quantity: 'dewPoint', kind: 'max', limit: 4 },
      { quantity: 'relativeHumidity', kind: 'min', limit: 5 },
      { quantity: 'relativeHumidity', kind: 'max', limit: 6 },
      { quantity: 'wetBulb', kind: 'min', limit: 7 },
      { quantity: 'wetBulb', kind: 'max', limit: 8 }
    ]);
  });
});
