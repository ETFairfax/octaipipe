import { describe, expect, it } from 'vitest';
import { formatDate } from './format-date.js';

describe('formatDate', () => {
  it('formats an ISO date in UTC', () => {
    expect(formatDate('2026-03-01T00:00:00Z')).toBe(
      new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(
        new Date('2026-03-01T00:00:00Z')
      )
    );
  });

  it('returns the fallback for missing input', () => {
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('returns the fallback for an unparseable date instead of throwing', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('uses a custom fallback when given', () => {
    expect(formatDate(undefined, 'n/a')).toBe('n/a');
  });
});
