import type { TimelinePaging } from './timeline-utils';

// Says how many rows are loaded, and offers a retry when the next page failed. The retry calls
// `fetchNextPage` directly because the calendar's own paging is suspended while `isNextPageError` is set.
function TimelineFooter({
  count,
  isLoading,
  paging
}: {
  count: number;
  isLoading: boolean;
  paging: TimelinePaging | undefined;
}) {
  return (
    <div
      className='sticky bottom-0 z-20 shrink-0 border-t bg-muted p-2 text-xs text-muted-foreground'
      aria-live='polite'
    >
      {isLoading ? (
        'Loading…'
      ) : (
        <>
          {`Showing ${count}${paging?.total === undefined ? '' : ` of ${paging.total}`}`}
          {paging?.isFetchingNextPage && <span> · loading more…</span>}
          {paging?.isNextPageError && !paging.isFetchingNextPage && (
            <span>
              {' · Could not load more '}
              <button
                type='button'
                className='underline underline-offset-2 hover:text-foreground'
                onClick={() => paging.fetchNextPage?.()}
              >
                Retry
              </button>
            </span>
          )}
        </>
      )}
    </div>
  );
}

export { TimelineFooter };
