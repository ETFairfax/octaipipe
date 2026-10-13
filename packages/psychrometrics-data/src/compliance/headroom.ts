import type { Bound } from './types.js';

/**
 * Distance from the value to the limit, in the quantity's unit, measured toward the inside of the
 * bound. Positive when within the limit, zero exactly on it, negative once the limit is broken.
 */
export const headroom = (value: number, bound: Bound): number =>
  bound.kind === 'min' ? value - bound.limit : bound.limit - value;
