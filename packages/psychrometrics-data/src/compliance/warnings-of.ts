import type { Envelope } from '../types/index.js';
import { envelopeBounds } from './envelope-bounds.js';
import { headroom } from './headroom.js';
import { quantityValue } from './quantity-value.js';
import type { DerivedReading, NearBoundWarning } from './types.js';
import { nearBoundMargins } from './types.js';

/** Warns about each envelope limit the reading is close to, i.e. within that quantity's margin (inclusive). */
export const warningsOf = (derived: DerivedReading, envelope: Envelope): NearBoundWarning[] =>
  envelopeBounds(envelope).flatMap(bound => {
    const value = quantityValue(derived, bound.quantity);
    const margin = nearBoundMargins[bound.quantity];
    return headroom(value, bound) <= margin ? [{ ...bound, value, margin }] : [];
  });
