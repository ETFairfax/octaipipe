import type { Locale } from 'date-fns';
import { memo, useMemo, useState } from 'react';
import { Button } from '../button';
import { Calendar } from '../calendar';
import { NavButton } from '../nav-button';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import {
  getTimelineCaption,
  shiftTimelineDate,
  type TimelineRange,
  type TimelineView
} from './timeline-utils';

// The top-left cell, spanning every header row: the date picker above the previous/next buttons.
// Memoised on shallow equality of its props.
const HeaderCorner = memo(function HeaderCorner({
  view,
  time,
  range,
  locale,
  captionWidth,
  onViewChange
}: {
  view: TimelineView;
  time: number;
  range: TimelineRange;
  locale: Locale | undefined;
  captionWidth: number;
  onViewChange: (view: TimelineView, date: Date) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const date = useMemo(() => new Date(time), [time]);
  const dateCaption = useMemo(() => getTimelineCaption(view, date, locale), [view, date, locale]);

  return (
    <div
      className='flex shrink-0 flex-col items-center justify-center gap-1 px-1'
      style={{ width: captionWidth }}
    >
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger
          render={<Button type='button' variant='link' size='xs' className='w-full min-w-0' />}
        >
          <span className='truncate'>{dateCaption}</span>
        </PopoverTrigger>
        <PopoverContent align='start' className='w-fit p-0'>
          <Calendar
            mode='single'
            locale={locale}
            selected={date}
            defaultMonth={date}
            captionLayout='dropdown'
            onSelect={picked => {
              if (!picked) return;
              setPickerOpen(false);
              onViewChange(view, picked);
            }}
          />
        </PopoverContent>
      </Popover>
      <div className='flex items-center gap-1'>
        <NavButton
          direction='previous'
          onClick={() => onViewChange(view, shiftTimelineDate(view, range.start, -1))}
        />
        <NavButton
          direction='next'
          onClick={() => onViewChange(view, shiftTimelineDate(view, range.start, 1))}
        />
      </div>
    </div>
  );
});

export { HeaderCorner };
