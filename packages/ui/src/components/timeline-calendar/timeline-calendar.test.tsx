import { cleanup, fireEvent, render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { TimelineCalendar, type TimelineRow } from './timeline-calendar';
import type { TimelineView } from './timeline-utils';

const rows: TimelineRow[] = [
  {
    id: 'pump',
    caption: 'Pump 1',
    events: [
      {
        id: 'running',
        kind: 'bar',
        start: new Date(2026, 9, 6, 6),
        end: new Date(2026, 9, 6, 10),
        tooltip: 'Running'
      },
      {
        id: 'later',
        kind: 'bar',
        start: new Date(2026, 9, 20, 6),
        end: new Date(2026, 9, 20, 10),
        tooltip: 'Later'
      },
      { id: 'started', kind: 'flag-in', start: new Date(2026, 9, 6, 6), tooltip: 'Started' }
    ]
  }
];

const renderCalendar = (
  view: TimelineView = 'day',
  props: Partial<ComponentProps<typeof TimelineCalendar<TimelineRow>>> = {}
) => {
  const onViewChange = props.onViewChange ?? vi.fn();
  const utils = render(
    <TimelineCalendar
      view={view}
      date={new Date(2026, 9, 6, 15)}
      items={rows}
      getRow={row => row}
      {...props}
      onViewChange={onViewChange}
    />
  );
  return { ...utils, onViewChange };
};

const manyRows = (count: number): TimelineRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    caption: `Row ${index}`,
    events: []
  }));

describe('TimelineCalendar', () => {
  // jsdom lays nothing out, so give the virtualizer a viewport to fill. Every element measures as
  // 800x400, which makes each row 400px tall and only the first few visible.
  const original = {
    rect: Element.prototype.getBoundingClientRect,
    height: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight'),
    width: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
  };
  beforeAll(() => {
    const size = { width: 800, height: 400 };
    Element.prototype.getBoundingClientRect = () => ({
      ...size,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: size.width,
      bottom: size.height,
      toJSON: () => ({})
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: size.height
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: size.width
    });
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
  });
  afterAll(() => {
    Element.prototype.getBoundingClientRect = original.rect;
    if (original.height)
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original.height);
    if (original.width) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', original.width);
    vi.unstubAllGlobals();
  });
  afterEach(cleanup);

  it('shows the row caption, and the period in the date button', () => {
    const view = renderCalendar();

    expect(view.getByText('Pump 1')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Tue 6 Oct 2026' })).toBeTruthy();
  });

  it('draws bars and captions as plain content when nothing handles selection', () => {
    const view = renderCalendar();

    expect(view.queryByRole('button', { name: 'Running' })).toBeNull();
    expect(view.queryByRole('button', { name: 'Pump 1' })).toBeNull();
  });

  it('reports a selected bar or flag with its row', () => {
    const onEventSelect = vi.fn();
    const view = renderCalendar('day', { onEventSelect });

    fireEvent.click(view.getByRole('button', { name: 'Running' }));
    fireEvent.click(view.getByRole('button', { name: 'Started' }));

    expect(onEventSelect).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id: 'running' }),
      rows[0]
    );
    expect(onEventSelect).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: 'started' }),
      rows[0]
    );
  });

  it('reports a selected row caption', () => {
    const onRowSelect = vi.fn();
    const view = renderCalendar('day', { onRowSelect });

    fireEvent.click(view.getByRole('button', { name: 'Pump 1' }));

    expect(onRowSelect).toHaveBeenCalledWith(rows[0]);
  });

  it('draws only the events inside the visible period', () => {
    const view = renderCalendar();

    expect(view.getByLabelText('Running')).toBeTruthy();
    expect(view.getByLabelText('Started')).toBeTruthy();
    expect(view.queryByLabelText('Later')).toBeNull();
  });

  it('brings an event into view when the period includes it', () => {
    const view = renderCalendar('month');

    expect(view.getByLabelText('Later')).toBeTruthy();
  });

  it('goes to the start of the previous and next period', () => {
    const onViewChange = vi.fn();
    const view = renderCalendar('month', { onViewChange });

    fireEvent.click(view.getByRole('button', { name: 'Previous' }));
    fireEvent.click(view.getByRole('button', { name: 'Next' }));

    expect(onViewChange).toHaveBeenNthCalledWith(1, 'month', new Date(2026, 8, 1));
    expect(onViewChange).toHaveBeenNthCalledWith(2, 'month', new Date(2026, 10, 1));
  });

  it('drills into a header period', () => {
    const onViewChange = vi.fn();
    const view = renderCalendar('day', { onViewChange });

    fireEvent.click(view.getByRole('button', { name: 'View month Oct' }));

    expect(onViewChange).toHaveBeenCalledWith('month', new Date(2026, 9, 1));
  });

  it('leaves hours as plain text', () => {
    const view = renderCalendar();

    expect(view.queryByRole('button', { name: /View hour/ })).toBeNull();
    expect(view.getByText('06')).toBeTruthy();
  });

  it('shows the empty message when there are no rows', () => {
    const view = renderCalendar('day', { items: [] });

    expect(view.getByText('Your search returned no results')).toBeTruthy();
  });

  it('draws only the rows near the viewport', () => {
    const view = renderCalendar('day', { items: manyRows(500) });

    const drawn = view.getAllByText(/^Row \d+$/).length;

    expect(drawn).toBeGreaterThan(0);
    expect(drawn).toBeLessThan(50);
  });

  it('maps only the items it draws, each once', () => {
    const getRow = vi.fn((item: TimelineRow) => item);
    const items = manyRows(500);
    const view = renderCalendar('day', { items, getRow });

    const mapped = getRow.mock.calls.length;
    view.rerender(
      <TimelineCalendar
        view='day'
        date={new Date(2026, 9, 6, 15)}
        onViewChange={vi.fn()}
        items={items}
        getRow={getRow}
        label='Again'
      />
    );

    expect(mapped).toBeGreaterThan(0);
    expect(mapped).toBeLessThan(50);
    expect(getRow).toHaveBeenCalledTimes(mapped);
  });

  it('does not map the items again when they come back in a new array', () => {
    const getRow = vi.fn((item: TimelineRow) => item);
    const items = manyRows(500);
    const view = renderCalendar('day', { items, getRow });

    const mapped = getRow.mock.calls.length;
    view.rerender(
      <TimelineCalendar
        view='day'
        date={new Date(2026, 9, 6, 15)}
        onViewChange={vi.fn()}
        items={[...items]}
        getRow={getRow}
      />
    );

    expect(getRow).toHaveBeenCalledTimes(mapped);
  });

  it('calls the latest selection callbacks, however often the caller replaces them', () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = renderCalendar('day', { onEventSelect: first });
    view.rerender(
      <TimelineCalendar
        view='day'
        date={new Date(2026, 9, 6, 15)}
        onViewChange={vi.fn()}
        items={rows}
        getRow={row => row}
        onEventSelect={second}
      />
    );

    fireEvent.click(view.getByRole('button', { name: 'Running' }));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(rows[0].events[0], rows[0]);
  });

  it('says how many rows are loaded, and how many there are in all', () => {
    const view = renderCalendar('day', { paging: { total: 40 } });

    expect(view.getByText('Showing 1 of 40')).toBeTruthy();
  });

  it('asks for the next page when the last loaded rows are near', () => {
    const fetchNextPage = vi.fn();
    renderCalendar('day', { items: manyRows(15), paging: { hasNextPage: true, fetchNextPage } });

    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('does not ask for a page while the end is far away, or when there is none to get', () => {
    const fetchNextPage = vi.fn();
    renderCalendar('day', { items: manyRows(500), paging: { hasNextPage: true, fetchNextPage } });
    cleanup();
    renderCalendar('day', { items: manyRows(15), paging: { hasNextPage: false, fetchNextPage } });
    cleanup();
    renderCalendar('day', {
      items: manyRows(15),
      paging: { hasNextPage: true, isFetchingNextPage: true, fetchNextPage }
    });

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('says loading, not "no results", while the first page is on its way', () => {
    const view = renderCalendar('day', { items: [], isLoading: true });

    expect(view.getByText('Loading…')).toBeTruthy();
    expect(view.queryByText('Your search returned no results')).toBeNull();
  });
});
