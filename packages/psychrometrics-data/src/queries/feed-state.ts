/** Wall-clock time without a new reading after which the displayed one is no longer current. */
export const staleAfterMs = 2500;

/** What the status is judged from; all of it is read off the feed's query. */
export type FeedHealth = {
  /** Wall-clock time of the last successful poll, not the reading's own timestamp. */
  lastSuccessAt: number | null;
  lastPollFailed: boolean;
  ended: boolean;
};

export type FeedStatus = 'loading' | 'live' | 'stale' | 'ended';

/**
 * Whether the displayed reading can be trusted as current. `now` is passed in so the status can
 * go stale with no new event: the feed simply stops delivering.
 */
export const selectFeedStatus = (health: FeedHealth, now: number): FeedStatus => {
  if (health.ended) return 'ended';
  if (health.lastSuccessAt === null) return health.lastPollFailed ? 'stale' : 'loading';
  return health.lastPollFailed || now - health.lastSuccessAt >= staleAfterMs ? 'stale' : 'live';
};
