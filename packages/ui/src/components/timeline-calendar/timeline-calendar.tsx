import { useVirtualizer } from '@tanstack/react-virtual';
import type { Locale } from 'date-fns';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef
} from 'react';
import { cn } from '../../lib/utils';
import { HeaderCorner } from './header-corner';
import { HeaderTrack } from './header-track';
import { TimelineFooter } from './timeline-footer';
import { TimelineRowView } from './timeline-row-view';
import {
  getTimelineHeaders,
  getTimelineRange,
  type TimelineEvent,
  type TimelineHeader,
  type TimelineLayout,
  type TimelinePaging,
  type TimelineRow,
  type TimelineView
} from './timeline-utils';

type TimelineCalendarProps<T extends { id: string | number }> = {
  view: TimelineView;
  /** Any moment within the period being shown. */
  date: Date;
  /** The user moved to another period, or drilled into a finer view. Keep it stable between renders. */
  onViewChange: (view: TimelineView, date: Date) => void;
  /** One per row. Events outside the visible period are not drawn. */
  items: readonly T[];
  /**
   * Turns an item into its row. It is called only for items that are drawn, and once for each, so
   * mapping a long list costs nothing for the rows never scrolled to. Keep it stable between renders:
   * a new function maps every drawn item again.
   */
  getRow: (item: T) => TimelineRow;
  /** Makes bars and flags buttons. */
  onEventSelect?: (event: TimelineEvent, row: TimelineRow) => void;
  /** Makes row captions buttons. */
  onRowSelect?: (row: TimelineRow) => void;
  locale?: Locale;
  /** Sizes in pixels; each defaults to `defaultLayout`. */
  layout?: Partial<TimelineLayout>;
  emptyMessage?: string;
  /** Set when the rows are one page of many: the next page loads as the user nears the last row. */
  paging?: TimelinePaging;
  /** The first page of a new list is on its way: shown rows fade, and the list returns to the top. */
  isLoading?: boolean;
  /** Names the scroll area for assistive tech. */
  label?: string;
  /** A Tailwind height class for the scroll area, which the rows are virtualized against. */
  height?: string;
};

// Start loading the next page while the user is still this many rows from the end. The last visible
// index already includes the overscan rows, so the page starts loading about this many plus
// `overscan` rows early.
const prefetchThreshold = 3;
const overscan = 10;
const defaultLayout: TimelineLayout = { captionWidth: 210, barHeight: 24, rowPadding: 4 };

// A horizontal timeline: one row per entity down the left, time across the top, events placed by
// when they happen. Everything about the period shown (its range, header rows, captions, where
// previous and next lead) is derived from `view` and `date`, so the only data it needs is the
// events. Positions are percentages of the visible range, so resizing needs no measuring.
//
// The rows are virtualized, so only the visible ones are in the DOM and each is mapped from its item
// only when drawn, however many have been loaded. The next page loads as the user nears the end. A
// row's height depends on how many lanes its events need, so rows are measured once drawn rather
// than known up front.
function TimelineCalendar<T extends { id: string | number }>({
  view,
  date,
  onViewChange,
  items,
  getRow,
  onEventSelect,
  onRowSelect,
  locale,
  layout,
  emptyMessage = 'Your search returned no results',
  paging,
  isLoading = false,
  label = 'Timeline',
  height = 'h-[70vh]'
}: TimelineCalendarProps<T>) {
  const scrollRef = useRef<HTMLElement>(null);
  const { captionWidth, barHeight, rowPadding } = { ...defaultLayout, ...layout };
  const { hasNextPage, isFetchingNextPage, isNextPageError, fetchNextPage } = paging ?? {};

  // Keyed on the time rather than the Date object, so a new Date for the same moment doesn't recompute.
  const time = date.getTime();
  const range = useMemo(() => getTimelineRange(view, new Date(time)), [view, time]);
  const headers = useMemo(() => getTimelineHeaders(view, range, locale), [view, range, locale]);

  // A row is mapped when its item is first drawn and kept while the item is, so its `events` array
  // stays the same and the memoised row view is not laid out again.
  const rowFor = useMemo(() => {
    const rows = new WeakMap<T, TimelineRow>();
    return (item: T) => {
      let row = rows.get(item);
      if (!row) {
        row = getRow(item);
        rows.set(item, row);
      }
      return row;
    };
  }, [getRow]);

  // The row views are memoised, so they get wrappers that never change and read the caller's latest
  // callbacks from a ref, so replacing a callback doesn't draw every row again.
  // The wrappers exist only while a callback is given, since that is what makes a button.
  const selectCallbacks = useRef({ onEventSelect, onRowSelect });
  useLayoutEffect(() => {
    selectCallbacks.current = { onEventSelect, onRowSelect };
  });
  const hasEventSelect = onEventSelect !== undefined;
  const hasRowSelect = onRowSelect !== undefined;
  const selectEvent = useMemo(
    () =>
      hasEventSelect
        ? (event: TimelineEvent, row: TimelineRow) =>
            selectCallbacks.current.onEventSelect?.(event, row)
        : undefined,
    [hasEventSelect]
  );
  const selectRow = useMemo(
    () =>
      hasRowSelect ? (row: TimelineRow) => selectCallbacks.current.onRowSelect?.(row) : undefined,
    [hasRowSelect]
  );

  const baseHeaders = headers.at(-1) ?? [];
  const captionStyle: CSSProperties = { width: captionWidth };
  // Shown rows fade while a new list loads, and an empty list that is loading isn't "no results".
  const isRefreshing = isLoading && items.length > 0;
  const showEmpty = !isLoading && items.length === 0;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => barHeight + rowPadding * 2,
    getItemKey: index => items[index].id,
    overscan
  });
  const virtualRows = virtualizer.getVirtualItems();
  const lastVisibleIndex = virtualRows.at(-1)?.index ?? -1;

  useEffect(() => {
    if (
      fetchNextPage &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isNextPageError &&
      lastVisibleIndex >= items.length - prefetchThreshold
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    isNextPageError,
    lastVisibleIndex,
    items.length,
    fetchNextPage
  ]);

  // The calendar stays mounted while a new list loads, so start the new list from the top.
  useEffect(() => {
    if (isLoading && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [isLoading]);

  // Stable between renders, so the memoised header is not drawn again as the rows scroll.
  const selectHeader = useCallback(
    (header: TimelineHeader) => {
      if (header.unit !== 'hour') onViewChange(header.unit, header.start);
    },
    [onViewChange]
  );

  return (
    <section
      ref={scrollRef}
      data-slot='timeline-calendar'
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the rows scroll inside this box, so it must be focusable for keyboard users to scroll it with the arrow, Page Up/Down and Home/End keys.
      tabIndex={0}
      className={cn(
        'relative flex flex-col overflow-auto rounded-md border text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring [scrollbar-color:var(--border)_transparent] scrollbar-thin',
        height
      )}
    >
      <div className='sticky top-0 z-20 flex shrink-0 border-b bg-muted dark:bg-background'>
        <HeaderCorner
          view={view}
          time={time}
          range={range}
          locale={locale}
          captionWidth={captionWidth}
          onViewChange={onViewChange}
        />
        <div className='flex-1'>
          {headers.map((row, index) => (
            <div key={row[0]?.unit} className='flex h-6'>
              <HeaderTrack
                headers={row}
                onSelect={selectHeader}
                className={index === headers.length - 1 ? undefined : 'border-b'}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className={cn(
          'relative isolate grow shrink-0 transition-opacity duration-200',
          isRefreshing && 'pointer-events-none opacity-40'
        )}
        aria-busy={isLoading}
        style={{ height: items.length === 0 ? undefined : virtualizer.getTotalSize() }}
      >
        {/* The pale time area, with a dashed divider at the start of each finest period. It sits
            behind the rows; the header rows above it have their own solid background. */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-y-0 right-0 -z-10 bg-muted/40 print:bg-transparent'
          style={{ left: captionWidth }}
        >
          {baseHeaders.map(header => (
            <div
              key={header.key}
              className='absolute inset-y-0 border-l border-dotted border-border'
              style={{ left: `${header.left}%` }}
            />
          ))}
        </div>

        {showEmpty && (
          <div className='flex border-b'>
            <div className='shrink-0' style={captionStyle} />
            <div className='flex-1 bg-background text-center leading-[2.2em] text-muted-foreground'>
              {emptyMessage}
            </div>
          </div>
        )}
        {virtualRows.map(virtualRow => {
          const item = items[virtualRow.index];
          return (
            <div
              key={item.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className='absolute inset-x-0 top-0'
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <TimelineRowView
                row={rowFor(item)}
                range={range}
                captionWidth={captionWidth}
                barHeight={barHeight}
                rowPadding={rowPadding}
                onEventSelect={selectEvent}
                onRowSelect={selectRow}
              />
            </div>
          );
        })}
      </div>

      <TimelineFooter count={items.length} isLoading={isLoading} paging={paging} />
    </section>
  );
}

export { TimelineCalendar, type TimelineCalendarProps, type TimelineRow };
