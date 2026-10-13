import type { Envelope } from '../types/index.js';
import { envelopeBounds } from './envelope-bounds.js';
import { headroom } from './headroom.js';
import { quantityValue } from './quantity-value.js';
import type { DerivedReading, Violation } from './types.js';

/**
 * Returns one violation per envelope limit the reading goes past, tagged with which envelope
 * (`name`) it came from. Sitting exactly on a limit is not a violation.
 */
export const violationsOf = (
  derived: DerivedReading,
  envelope: Envelope,
  name: Violation['envelope']
): Violation[] =>
  envelopeBounds(envelope).flatMap(bound => {
    const value = quantityValue(derived, bound.quantity);
    return headroom(value, bound) < 0 ? [{ ...bound, envelope: name, value }] : [];
  });
