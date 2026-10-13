import { LogInIcon, LogOutIcon } from 'lucide-react';
import { type CSSProperties, memo, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import {
  isTimelineBar,
  type PlacedTimelineEvent,
  type TimelineEvent,
  type TimelineRow
} from './timeline-utils';

// How far a bar is inset from the top and bottom of its lane, in pixels. A skinny bar is inset more,
// so it is a thinner strip centred on the same line as a full bar.
const barInset = 2;
const skinnyBarInset = 6;

// Memoised so an event whose placement and callback are unchanged is not drawn again with its row.
const PlacedEvent = memo(function PlacedEvent({
  entry,
  row,
  barHeight,
  rowPadding,
  onSelect: onSelectEvent
}: {
  entry: PlacedTimelineEvent;
  row: TimelineRow;
  barHeight: number;
  rowPadding: number;
  onSelect: ((event: TimelineEvent, row: TimelineRow) => void) | undefined;
}) {
  const { event, left, width, lane } = entry;
  const onSelect = onSelectEvent && (() => onSelectEvent(event, row));

  if (!isTimelineBar(event)) {
    const Icon = event.kind === 'flag-in' ? LogInIcon : LogOutIcon;
    return (
      <EventElement
        label={event.tooltip}
        onSelect={onSelect}
        className={cn(
          'absolute z-10 -translate-x-1/2 rounded-full bg-background p-0.5 shadow-sm ring-1 ring-border',
          event.kind === 'flag-in' ? 'text-chart-3' : 'text-destructive',
          event.className
        )}
        style={{ left: `${left}%`, top: rowPadding + barInset }}
      >
        <Icon className='size-3' aria-hidden='true' />
      </EventElement>
    );
  }

  // A skinny bar is a thinner, darker strip, for a pair of clock events. Colour comes from the
  // event's `className`.
  const skinny = event.kind === 'skinny-bar';
  const inset = skinny ? skinnyBarInset : barInset;
  const duration = event.end.getTime() - event.start.getTime();
  return (
    <EventElement
      label={event.tooltip}
      onSelect={onSelect}
      className={cn(
        'absolute min-w-0.5 overflow-hidden border border-foreground/40',
        skinny ? 'bg-foreground/60' : 'bg-muted-foreground/40',
        event.className
      )}
      style={{
        left: `${left}%`,
        width: `${width}%`,
        top: rowPadding + lane * barHeight + inset,
        height: barHeight - inset * 2
      }}
    >
      {event.kind === 'chevroned-bar' && duration > 0 && (
        <>
          <span
            aria-hidden='true'
            className='inline-block h-full'
            style={{
              width: `${toleranceShare(event.startTolerance, duration)}%`,
              ...chevronStyle(chevronRight)
            }}
          />
          <span
            aria-hidden='true'
            className='float-right inline-block h-full'
            style={{
              width: `${toleranceShare(event.endTolerance, duration)}%`,
              ...chevronStyle(chevronLeft)
            }}
          />
        </>
      )}
    </EventElement>
  );
});

// A button when the event can be selected, otherwise a labelled image.
function EventElement({
  label,
  onSelect,
  className,
  style,
  children
}: {
  label: string | undefined;
  onSelect: (() => void) | undefined;
  className: string;
  style: CSSProperties;
  children: ReactNode;
}) {
  if (onSelect) {
    return (
      <button
        type='button'
        title={label}
        aria-label={label}
        onClick={onSelect}
        className={cn(
          className,
          'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
        style={style}
      >
        {children}
      </button>
    );
  }
  return (
    <div role='img' title={label} aria-label={label} className={className} style={style}>
      {children}
    </div>
  );
}

// A tolerance's share of its bar, kept between none and half so the two chevrons never cross.
const toleranceShare = (toleranceMinutes: number, durationMs: number) =>
  Math.min(Math.max((toleranceMinutes * 60000 * 100) / durationMs, 0), 50);

// Tolerance chevrons, pointing into the bar from each end. Drawn as a repeating SVG data-URI
// background on an element whose width is a percentage of the bar, so tiling needs no measuring.
const chevronSvg = (path: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='12' viewBox='0 0 8 12' preserveAspectRatio='none'><path d='${path}' fill='none' stroke='white' stroke-opacity='.7' stroke-width='1.5'/></svg>`
  )}")`;
const chevronRight = chevronSvg('M2 1 L6 6 L2 11');
const chevronLeft = chevronSvg('M6 1 L2 6 L6 11');
const chevronStyle = (image: string): CSSProperties => ({
  backgroundImage: image,
  backgroundRepeat: 'repeat-x',
  backgroundSize: '8px 100%'
});

export { PlacedEvent };
