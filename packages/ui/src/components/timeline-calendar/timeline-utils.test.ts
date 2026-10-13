import { describe, expect, it } from 'vitest';
import {
  getTimelineCaption,
  getTimelineHeaders,
  getTimelineRange,
  layoutTimelineRow,
  shiftTimelineDate,
  type TimelineEvent
} from './timeline-utils';

const wednesday = new Date(2026, 9, 7, 15, 30); // Wed 7 Oct 2026

describe('getTimelineRange', () => {
  it('is the day', () => {
    expect(getTimelineRange('day', wednesday)).toEqual({
      start: new Date(2026, 9, 7),
      end: new Date(2026, 9, 8)
    });
  });

  it('is Monday to Monday for a week', () => {
    expect(getTimelineRange('week', wednesday)).toEqual({
      start: new Date(2026, 9, 5),
      end: new Date(2026, 9, 12)
    });
  });

  it('is the calendar month', () => {
    expect(getTimelineRange('month', wednesday)).toEqual({
      start: new Date(2026, 9, 1),
      end: new Date(2026, 10, 1)
    });
  });

  it('runs a year from the Monday of the week to the end of the week a year on', () => {
    // 5 Oct 2027 is a Tuesday, so the range ends after the week that began Mon 4 Oct 2027.
    expect(getTimelineRange('year', wednesday)).toEqual({
      start: new Date(2026, 9, 5),
      end: new Date(2027, 9, 11)
    });
  });
});

describe('shiftTimelineDate', () => {
  it('moves a year by a week and a month by a month', () => {
    expect(shiftTimelineDate('year', wednesday, 1)).toEqual(new Date(2026, 9, 14, 15, 30));
    expect(shiftTimelineDate('month', wednesday, -1)).toEqual(new Date(2026, 8, 7, 15, 30));
  });
});

describe('getTimelineCaption', () => {
  it('names the period', () => {
    expect(getTimelineCaption('month', wednesday)).toBe('October 2026');
    expect(getTimelineCaption('day', wednesday)).toBe('Wed 7 Oct 2026');
    expect(getTimelineCaption('year', wednesday)).toMatch(/^From: W41 /);
  });
});

describe('getTimelineHeaders', () => {
  it('has a row per unit, coarsest first, ending on the finest', () => {
    const rows = getTimelineHeaders('day', getTimelineRange('day', wednesday));

    expect(rows.map(row => row[0]?.unit)).toEqual(['year', 'month', 'week', 'day', 'hour']);
    expect(rows.at(-1)).toHaveLength(24);
  });

  it('positions periods as a share of the range', () => {
    const [hours] = getTimelineHeaders('day', getTimelineRange('day', wednesday)).slice(-1);

    expect(hours?.[6]).toMatchObject({ caption: '06', left: 25 });
    expect(hours?.[6]?.width).toBeCloseTo(100 / 24);
  });

  it('clips a period cut off by the range but keeps its own start', () => {
    const rows = getTimelineHeaders('week', getTimelineRange('week', new Date(2026, 9, 28)));
    const months = rows[1];

    expect(months?.map(month => month.caption)).toEqual(['Oct', 'Nov']);
    expect(months?.[0]?.start).toEqual(new Date(2026, 9, 1));
    expect(months?.[0]?.left).toBe(0);
    // 26 to 31 Oct is 6 of the 7 days.
    expect(months?.[0]?.width).toBeCloseTo((6 / 7) * 100);
  });

  it('shows weeks, months and years for a year', () => {
    const rows = getTimelineHeaders('year', getTimelineRange('year', wednesday));

    expect(rows.map(row => row[0]?.unit)).toEqual(['year', 'month', 'week']);
    expect(rows.at(-1)).toHaveLength(53);
  });

  it('is unaffected by the clocks changing', () => {
    // The UK clocks go back on Sun 25 Oct 2026, so that day has 25 hours.
    const rows = getTimelineHeaders('week', getTimelineRange('week', new Date(2026, 9, 26)));
    const widths = rows.at(-1)?.map(day => day.width) ?? [];

    expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(100);
  });
});

const day = getTimelineRange('day', wednesday);
const at = (hour: number) => new Date(2026, 9, 7, hour);
const bar = (id: string, from: number, to: number, allowCollisions?: boolean): TimelineEvent => ({
  id,
  kind: 'bar',
  start: at(from),
  end: at(to),
  allowCollisions
});

describe('layoutTimelineRow', () => {
  it('keeps events that do not overlap on one lane', () => {
    const { placed, lanes } = layoutTimelineRow([bar('a', 1, 3), bar('b', 3, 5)], day);

    expect(placed.map(p => p.lane)).toEqual([0, 0]);
    expect(lanes).toBe(1);
  });

  it('puts an overlapping bar on the next lane', () => {
    const { placed, lanes } = layoutTimelineRow([bar('a', 1, 5), bar('b', 2, 4)], day);

    expect(placed.map(p => p.lane)).toEqual([0, 1]);
    expect(lanes).toBe(2);
  });

  it('reuses a free lane', () => {
    const { placed } = layoutTimelineRow([bar('a', 1, 5), bar('b', 2, 3), bar('c', 4, 6)], day);

    expect(placed.map(p => [p.event.id, p.lane])).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 1]
    ]);
  });

  it('lets a bar opt out of stacking', () => {
    const { placed } = layoutTimelineRow([bar('a', 1, 5), bar('b', 2, 4, true)], day);

    expect(placed.map(p => p.lane)).toEqual([0, 0]);
  });

  it('does not stack the same events differently by input order', () => {
    const forwards = layoutTimelineRow([bar('a', 1, 5), bar('b', 2, 4)], day).lanes;
    const backwards = layoutTimelineRow([bar('b', 2, 4), bar('a', 1, 5)], day).lanes;

    expect(backwards).toBe(forwards);
  });

  it('drops events outside the range and clips those crossing its edge', () => {
    const { placed } = layoutTimelineRow(
      [
        bar('before', -5, -3),
        { id: 'crossing', kind: 'bar', start: at(-2), end: at(6) },
        { id: 'flag', kind: 'flag-in', start: at(30) }
      ],
      day
    );

    expect(placed.map(p => p.event.id)).toEqual(['crossing']);
    expect(placed[0]).toMatchObject({ left: 0, width: 25 });
  });

  it('places a flag without taking a lane', () => {
    const { placed, lanes } = layoutTimelineRow(
      [{ id: 'flag', kind: 'flag-in', start: at(12) }, bar('a', 11, 13)],
      day
    );

    expect(lanes).toBe(1);
    expect(placed.find(p => p.event.id === 'flag')).toMatchObject({ left: 50, width: 0 });
  });
});
