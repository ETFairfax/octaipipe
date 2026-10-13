import { describe, expect, it } from 'vitest';
import { type FeedHealth, selectFeedStatus, staleAfterMs } from './feed-state.js';

const health = (overrides: Partial<FeedHealth> = {}): FeedHealth => ({
  lastSuccessAt: null,
  lastPollFailed: false,
  ended: false,
  ...overrides
});

describe('selectFeedStatus', () => {
  it('is loading until the first reading arrives', () => {
    expect(selectFeedStatus(health(), 5000)).toBe('loading');
  });

  it('is live right after a reading', () => {
    expect(selectFeedStatus(health({ lastSuccessAt: 2000 }), 2100)).toBe('live');
  });

  it('is stale when no failure happened but no new reading arrived for 2.5 s', () => {
    const state = health({ lastSuccessAt: 10_000 });

    expect(selectFeedStatus(state, 10_000 + staleAfterMs - 1)).toBe('live');
    expect(selectFeedStatus(state, 10_000 + staleAfterMs)).toBe('stale');
  });

  it('is stale after a failed poll even though a reading was just received', () => {
    const state = health({ lastSuccessAt: 2000, lastPollFailed: true });

    expect(selectFeedStatus(state, 2100)).toBe('stale');
  });

  it('is stale, not loading, when the very first poll fails', () => {
    expect(selectFeedStatus(health({ lastPollFailed: true }), 0)).toBe('stale');
  });

  it('is ended whatever else is true, and never goes stale', () => {
    const state = health({ lastSuccessAt: 1000, ended: true });

    expect(selectFeedStatus(state, 999_999)).toBe('ended');
  });
});
