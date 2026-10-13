import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@workspace/api-client';
import type { KyInstance } from 'ky';
import { useCallback, useState } from 'react';
import { z } from 'zod';
import { psychrometricsKeys } from '../keys.js';
import { type Reading, ReadingSchema } from '../types/index.js';
import { selectFeedStatus } from './feed-state.js';
import { useNow } from './use-now.js';

/** The current reading plus the previous six. */
export const trailLength = 7;

export const pollIntervalMs = 1000;
/** A poll still pending after this long is reported as slow. */
export const slowAfterMs = 1500;

// `ended` is explicit because an empty answer alone cannot tell "nothing new yet" from "no more".
const ReadingAfterSchema = z.object({ reading: ReadingSchema.nullable(), ended: z.boolean() });

/**
 * The first reading strictly after `after` (an ISO timestamp), or the site's first reading when
 * `after` is omitted. The caller owns the position, so a call is safe to retry. Resolves `null`
 * once the site has no reading after `after`: the end of the feed is an answer, not a failure.
 */
export const fetchReadingAfter = async (apiClient: KyInstance, siteId: string, after?: string) => {
  const searchParams = after === undefined ? undefined : { after };

  const body = ReadingAfterSchema.parse(
    await apiClient
      // A failed poll is meant to surface and be retried by the next interval tick, so the call is made once.
      .get(`psychrometrics/sites/${siteId}/readings`, { retry: 0, searchParams })
      .json()
  );
  return body.ended ? null : body.reading;
};

/** What the feed query caches: the trail built so far, and whether the site has run out. */
export type FeedSnapshot = { trail: Reading[]; ended: boolean };

/**
 * `pollStartedAt`, when given, holds the start time of each site's in-flight poll: stamped when the
 * poll begins and removed when it settles, so a reader can tell how long it has been pending.
 */
export const getNextReadingOptions = (
  apiClient: KyInstance,
  siteId: string,
  pollStartedAt?: Map<string, number>
) => {
  const queryKey = psychrometricsKeys.reading(siteId);
  return queryOptions({
    queryKey,
    // The cached trail's last reading is the cursor: a failed poll leaves the trail in place, so the
    // next tick asks for the same reading again, and a reset query starts from the first reading
    // with an empty trail. The end of the feed is a successful snapshot with `ended` set, so the
    // query cache and devtools never see it as an error.
    queryFn: async ({ client }): Promise<FeedSnapshot> => {
      const { trail } = client.getQueryData<FeedSnapshot>(queryKey) ?? { trail: [] };
      pollStartedAt?.set(siteId, Date.now());
      try {
        const next = await fetchReadingAfter(apiClient, siteId, trail.at(-1)?.timestamp);
        return next === null
          ? { trail, ended: true }
          : { trail: [...trail, next].slice(-trailLength), ended: false };
      } finally {
        pollStartedAt?.delete(siteId);
      }
    },
    // A failed poll is shown as stale and the next interval tick is the retry. gcTime 0 so a
    // remount starts from nothing instead of replaying the last cached trail as new.
    retry: false,
    // A monitor on a second screen or a covered tab must keep polling, or it would go stale unseen.
    refetchIntervalInBackground: true,
    gcTime: 0,
    staleTime: 0,
    refetchInterval: query => (query.state.data?.ended ? false : pollIntervalMs)
  });
};

/** Polls one site, one reading per second, and reports the trail it has built and its status. */
export const useSiteFeed = (siteId: string) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  // Stamped by the query function itself and keyed by site, so a poll's age needs no extra render
  // and a switch of site cannot inherit another site's start time. The clock tick below re-renders
  // often enough for `isSlow` to be read off it.
  const [pollStartedAt] = useState(() => new Map<string, number>());
  const { data, dataUpdatedAt, error } = useQuery(
    getNextReadingOptions(apiClient, siteId, pollStartedAt)
  );
  const now = useNow();
  const trail = data?.trail ?? [];
  const startedAt = pollStartedAt.get(siteId);

  // Replay is local: clearing the query forgets the trail and the cursor, so the next poll asks
  // for the first reading again, and the ended flag is gone so the interval resumes.
  const replay = useCallback(() => {
    queryClient
      .resetQueries({ queryKey: psychrometricsKeys.reading(siteId) })
      .catch(() => undefined);
  }, [queryClient, siteId]);

  // The query keeps its data through a failed poll, so a failure and a last success coexist.
  const ended = data?.ended ?? false;
  const lastSuccessAt = data === undefined ? null : dataUpdatedAt;
  const status = selectFeedStatus({ lastSuccessAt, lastPollFailed: error !== null, ended }, now);
  return {
    trail,
    current: trail.at(-1),
    status,
    /** Wall-clock milliseconds since the last successful poll. */
    ageMs: lastSuccessAt === null ? null : now - lastSuccessAt,
    /** A poll is in flight and has taken longer than expected. */
    isSlow: startedAt !== undefined && now - startedAt > slowAfterMs,
    replay
  };
};
