import { describe, expect, it } from 'vitest';
import { headroom } from './headroom.js';

describe('headroom', () => {
  it('is value minus limit for a minimum', () => {
    const bound = { quantity: 'dryBulb', kind: 'min', limit: 18 } as const;

    expect(headroom(20, bound)).toBe(2);
    expect(headroom(17, bound)).toBe(-1);
  });

  it('is limit minus value for a maximum', () => {
    const bound = { quantity: 'dryBulb', kind: 'max', limit: 27 } as const;

    expect(headroom(25, bound)).toBe(2);
    expect(headroom(28, bound)).toBe(-1);
  });

  it('is zero at the limit', () => {
    expect(headroom(27, { quantity: 'dryBulb', kind: 'max', limit: 27 })).toBe(0);
    expect(headroom(18, { quantity: 'dryBulb', kind: 'min', limit: 18 })).toBe(0);
  });
});
