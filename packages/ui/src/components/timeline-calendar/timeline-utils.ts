import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  format,
  getISOWeek,
  type Locale,
  max,
  min,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMilliseconds
} from 'date-fns';

export const timelineViews = ['day', 'week', 'month', 'year'] as const;
export type TimelineView = (typeof timelineViews)[number];

// A header row is made of periods of one unit. Only a view can be drilled into, so `hour` is a unit
// but not a view.
export type TimelineUnit = 'hour' | TimelineView;

// `end` is exclusive: it is the start of whatever comes after the visible period.
export type TimelineRange = { start: Date; end: Date };

type EventBase = {
  /** Unique among one row's events: it keys the rendered element. */
  id: string | number;
  start: Date;
  tooltip?: string;
  className?: string;
};

export type TimelineEvent =
  | (EventBase & { kind: 'bar' | 'skinny-bar'; end: Date; allowCollisions?: boolean })
  | (EventBase & {
      kind: 'chevroned-bar';
      end: Date;
      /** Minutes of tolerance shown at each end of the bar. */
      startTolerance: number;
      endTolerance: number;
      allowCollisions?: boolean;
    })
  | (EventBase & { kind: 'flag-in' | 'flag-out' });

export type TimelineBar = Extract<TimelineEvent, { end: Date }>;

// Bars have a duration; flags mark a moment.
export const isTimelineBar = (event: TimelineEvent): event is TimelineBar => 'end' in event;

export type TimelineHeader = {
  /** Identifies the period within its row. */
  key: string;
  unit: TimelineUnit;
  /** Start of the whole period, which can lie before the visible range. */
  start: Date;
  caption: string;
  /** Position within the visible range, as a percentage. */
  left: number;
  width: number;
};

export type TimelineRow = {
  id: string | number;
  caption: string;
  captionTooltip?: string;
  /** The row is laid out again only when this array's identity changes. */
  events: readonly TimelineEvent[];
};

export type TimelineLayout = {
  /** Width of the captions column, in pixels. */
  captionWidth: number;
  /** Height of one lane of events, in pixels. */
  barHeight: number;
  /** Space above the first lane and below the last, in pixels. */
  rowPadding: number;
};

export type TimelinePaging = {
  /** Rows across all pages, for the footer's "Showing x of y". */
  total?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  /**
   * Loading the next page failed. The loaded rows stay, the footer says so with a retry, and pages
   * stop loading on their own until the retry succeeds.
   */
  isNextPageError?: boolean;
  /** Called as the user nears the last loaded row while `hasNextPage` is set. */
  fetchNextPage?: () => void;
};

export type PlacedTimelineEvent = {
  event: TimelineEvent;
  left: number;
  /** Zero for a flag, which has no duration. */
  width: number;
  lane: number;
};

// Weeks start on Monday throughout, and a year is a run of whole weeks.
const weekOptions = { weekStartsOn: 1 } as const;

// What each view shows, finest header row first.
const headerUnits: Record<TimelineView, readonly TimelineUnit[]> = {
  day: ['hour', 'day', 'week', 'month', 'year'],
  week: ['day', 'week', 'month', 'year'],
  month: ['day', 'week', 'month', 'year'],
  year: ['week', 'month', 'year']
};

const nextPeriod: Record<TimelineUnit, (date: Date) => Date> = {
  hour: date => addHours(date, 1),
  day: date => addDays(date, 1),
  week: date => addWeeks(date, 1),
  month: date => addMonths(date, 1),
  year: date => addYears(date, 1)
};

const periodStarts: Record<TimelineUnit, (range: TimelineRange) => Date[]> = {
  hour: range => eachHourOfInterval(range),
  day: range => eachDayOfInterval(range),
  week: range => eachWeekOfInterval(range, weekOptions),
  month: range => eachMonthOfInterval(range),
  year: range => eachYearOfInterval(range)
};

// The period `view` shows around `date`. A year runs from the Monday of `date`'s week to the end of
// the week a year on, so it is 52 or 53 whole weeks and moves a week at a time.
export function getTimelineRange(view: TimelineView, date: Date): TimelineRange {
  switch (view) {
    case 'day': {
      const start = startOfDay(date);
      return { start, end: addDays(start, 1) };
    }
    case 'week': {
      const start = startOfWeek(date, weekOptions);
      return { start, end: addWeeks(start, 1) };
    }
    case 'month': {
      const start = startOfMonth(date);
      return { start, end: addMonths(start, 1) };
    }
    case 'year': {
      const start = startOfWeek(date, weekOptions);
      return { start, end: addWeeks(startOfWeek(addYears(start, 1), weekOptions), 1) };
    }
  }
}

// `date` moved by `steps` periods of `view`; a year moves by weeks, to match its range.
export function shiftTimelineDate(view: TimelineView, date: Date, steps: number): Date {
  switch (view) {
    case 'day':
      return addDays(date, steps);
    case 'week':
    case 'year':
      return addWeeks(date, steps);
    case 'month':
      return addMonths(date, steps);
  }
}

export function getTimelineCaption(view: TimelineView, date: Date, locale?: Locale): string {
  const { start } = getTimelineRange(view, date);
  switch (view) {
    case 'day':
      return format(start, 'EEE d MMM yyyy', { locale });
    case 'week':
      return `w/c ${format(start, 'P', { locale })}`;
    case 'month':
      return format(start, 'MMMM yyyy', { locale });
    case 'year':
      return `From: W${format(start, 'II', { locale })} ${format(start, 'P', { locale })}`;
  }
}

// How a day is captioned in each view's day row: the wider the view, the shorter the caption.
const dayCaptionFormats: Record<TimelineView, string> = {
  day: 'EEEE d MMMM yyyy',
  week: 'EEE d',
  month: 'dd',
  year: 'dd'
};

function headerCaption(view: TimelineView, unit: TimelineUnit, start: Date, locale?: Locale) {
  switch (unit) {
    case 'hour':
      return format(start, 'HH', { locale });
    case 'day':
      return format(start, dayCaptionFormats[view], { locale });
    case 'week':
      return view === 'year'
        ? format(start, 'II', { locale })
        : `W${getISOWeek(start)}: ${format(start, 'd MMM', { locale })}`;
    case 'month':
      return format(start, 'MMM', { locale });
    case 'year':
      return format(start, 'yyyy', { locale });
  }
}

const percentOf = (date: Date, range: TimelineRange) =>
  ((date.getTime() - range.start.getTime()) / (range.end.getTime() - range.start.getTime())) * 100;

// The header rows for `view`, coarsest first, so the last row is the finest and the one the
// calendar draws its dividers from. A period cut off by the edge of the range keeps its own start
// and is clipped only for position.
export function getTimelineHeaders(
  view: TimelineView,
  range: TimelineRange,
  locale?: Locale
): TimelineHeader[][] {
  // The interval functions include the period containing their end, so stop just short of it.
  const interval = { start: range.start, end: subMilliseconds(range.end, 1) };

  return headerUnits[view]
    .map(unit =>
      periodStarts[unit](interval).map(start => {
        const from = max([start, range.start]);
        const to = min([nextPeriod[unit](start), range.end]);
        return {
          key: `${unit}-${start.getTime()}`,
          unit,
          start,
          caption: headerCaption(view, unit, start, locale),
          left: percentOf(from, range),
          width: percentOf(to, range) - percentOf(from, range)
        };
      })
    )
    .reverse();
}

// Places a row's events within `range`: those outside it are dropped, and those that cross its edge
// are clipped. Bars that overlap in time go on separate lanes (first free lane, earliest start
// first), so a row is as many lanes tall as its busiest moment. Flags mark a moment and sit over
// the bars without taking a lane.
export function layoutTimelineRow(
  events: readonly TimelineEvent[],
  range: TimelineRange
): { placed: PlacedTimelineEvent[]; lanes: number } {
  const placed: PlacedTimelineEvent[] = [];
  const bars: { event: TimelineBar; from: Date; to: Date }[] = [];

  for (const event of events) {
    if (!isTimelineBar(event)) {
      if (event.start >= range.start && event.start < range.end) {
        placed.push({ event, left: percentOf(event.start, range), width: 0, lane: 0 });
      }
    } else if (event.end > range.start && event.start < range.end) {
      bars.push({ event, from: max([event.start, range.start]), to: min([event.end, range.end]) });
    }
  }

  bars.sort((a, b) => a.from.getTime() - b.from.getTime() || b.to.getTime() - a.to.getTime());

  const laneEnds: number[] = [];
  for (const { event, from, to } of bars) {
    let lane = 0;
    if (!event.allowCollisions) {
      lane = laneEnds.findIndex(laneEnd => laneEnd <= from.getTime());
      if (lane === -1) lane = laneEnds.length;
    }
    laneEnds[lane] = Math.max(laneEnds[lane] ?? 0, to.getTime());
    placed.push({
      event,
      left: percentOf(from, range),
      width: percentOf(to, range) - percentOf(from, range),
      lane
    });
  }

  return { placed, lanes: Math.max(laneEnds.length, 1) };
}
