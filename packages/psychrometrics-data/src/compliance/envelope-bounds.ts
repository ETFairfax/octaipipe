import type { Envelope } from '../types/index.js';
import type { Bound } from './types.js';

const boundKeys = [
  ['dryBulbMinC', 'dryBulb', 'min'],
  ['dryBulbMaxC', 'dryBulb', 'max'],
  ['dewPointMinC', 'dewPoint', 'min'],
  ['dewPointMaxC', 'dewPoint', 'max'],
  ['rhMinPct', 'relativeHumidity', 'min'],
  ['rhMaxPct', 'relativeHumidity', 'max'],
  ['wetBulbMinC', 'wetBulb', 'min'],
  ['wetBulbMaxC', 'wetBulb', 'max']
] as const;

/** Lists every limit an envelope sets as a Bound; limits the envelope leaves undefined are skipped. */
export const envelopeBounds = (envelope: Envelope): Bound[] =>
  boundKeys.flatMap(([key, quantity, kind]) => {
    const limit = envelope[key];
    return limit === undefined ? [] : [{ quantity, kind, limit }];
  });
