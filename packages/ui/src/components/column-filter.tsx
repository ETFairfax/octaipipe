import { FilterIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './button';
import { FilterChecklist } from './filter-checklist';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

type Props<T extends string | number> = {
  items: readonly T[];
  value: T[];
  onValueChange: (value: T[]) => void;
  /** Names the column being filtered, e.g. "status". Builds the trigger's accessible name. */
  label: string;
  getLabel: (item: T) => string;
  /** How an item renders next to its checkbox. Defaults to `getLabel`. */
  renderItem?: (item: T) => ReactNode;
};

// A filter for one column, opened from an icon so it fits in a column header. Selection is
// controlled; an empty `value` means "no filter", which shows every option ticked.
function ColumnFilter<T extends string | number>({
  items,
  value,
  onValueChange,
  label,
  getLabel,
  renderItem
}: Props<T>) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='ghost'
            className={`${value.length > 0 ? 'text-primary' : ''}`}
            size='icon-xs'
            aria-label={`Filter by ${label}`}
          />
        }
      >
        <FilterIcon color='currentColor' aria-hidden='true' />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-fit min-w-40 gap-1'>
        <FilterChecklist
          items={items}
          value={value}
          onValueChange={onValueChange}
          getLabel={getLabel}
          renderItem={renderItem}
        />
      </PopoverContent>
    </Popover>
  );
}

export { ColumnFilter };
