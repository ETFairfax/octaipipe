import { memo, useMemo } from 'react';
import { PlacedEvent } from './placed-event';
import {
  layoutTimelineRow,
  type TimelineEvent,
  type TimelineRange,
  type TimelineRow
} from './timeline-utils';

// Memoised on shallow equality of `row`, `range`, the size props and the two callbacks, so the layout
// only reruns when one of those changes identity.
const TimelineRowView = memo(function TimelineRowView({
  row,
  range,
  captionWidth,
  barHeight,
  rowPadding,
  onEventSelect,
  onRowSelect
}: {
  row: TimelineRow;
  range: TimelineRange;
  captionWidth: number;
  barHeight: number;
  rowPadding: number;
  onEventSelect: ((event: TimelineEvent, row: TimelineRow) => void) | undefined;
  onRowSelect: ((row: TimelineRow) => void) | undefined;
}) {
  const { placed, lanes } = useMemo(
    () => layoutTimelineRow(row.events, range),
    [row.events, range]
  );

  return (
    <div
      className='flex overflow-hidden border-b'
      style={{ height: lanes * barHeight + rowPadding * 2 }}
    >
      <div
        className='relative z-10 shrink-0 truncate bg-muted/50 p-1 text-[85%] leading-[1.7em]'
        title={row.captionTooltip ?? row.caption}
        style={{ width: captionWidth }}
      >
        {onRowSelect ? (
          <button
            type='button'
            className='block max-w-full truncate text-left hover:underline'
            onClick={() => onRowSelect(row)}
          >
            {row.caption}
          </button>
        ) : (
          row.caption
        )}
      </div>
      <div className='relative flex-1'>
        {placed.map(entry => (
          <PlacedEvent
            key={entry.event.id}
            entry={entry}
            barHeight={barHeight}
            rowPadding={rowPadding}
            row={row}
            onSelect={onEventSelect}
          />
        ))}
      </div>
    </div>
  );
});

export { TimelineRowView };
