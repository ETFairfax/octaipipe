import { memo } from 'react';
import { cn } from '../../lib/utils';
import type { TimelineHeader } from './timeline-utils';

// One header row: each period absolutely positioned across the track. Memoised on shallow equality
// of its props.
const HeaderTrack = memo(function HeaderTrack({
  headers,
  onSelect,
  className
}: {
  headers: readonly TimelineHeader[];
  onSelect: (header: TimelineHeader) => void;
  className?: string;
}) {
  return (
    <div className={cn('relative flex-1', className)}>
      {headers.map(header => (
        <div
          key={header.key}
          className='absolute inset-y-0 border-l pt-0.5 text-center'
          style={{ left: `${header.left}%`, width: `${header.width}%` }}
        >
          {header.unit === 'hour' ? (
            <b className='font-medium'>{header.caption}</b>
          ) : (
            <button
              type='button'
              className='w-full truncate px-1 hover:underline text-primary'
              aria-label={`View ${header.unit} ${header.caption}`}
              onClick={() => onSelect(header)}
            >
              {header.caption}
            </button>
          )}
        </div>
      ))}
    </div>
  );
});

export { HeaderTrack };
