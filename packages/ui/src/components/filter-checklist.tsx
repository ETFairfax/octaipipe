import { type ReactNode, useId } from 'react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { FieldLegend, FieldSet } from './field';
import { Label } from './label';
import { Separator } from './separator';

type Props<T extends string | number> = {
  items: readonly T[];
  value: T[];
  onValueChange: (value: T[]) => void;
  getLabel: (item: T) => string;
  /** Names the group of options. Without it the options render bare, under a name the host gives. */
  title?: string;
  /** How an item renders next to its checkbox. Defaults to `getLabel`. */
  renderItem?: (item: T) => ReactNode;
};

// A checkbox with its label, tied together by id so a click on the text toggles it too.
function FilterOption({
  checked,
  onCheckedChange,
  children
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className='flex items-center gap-2 rounded-sm p-1.5 hover:bg-muted'>
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className='flex-1 cursor-pointer'>
        {children}
      </Label>
    </div>
  );
}

// The options of one filter, with a "Show all" reset. Selection is controlled; an empty `value`
// means "no filter", which shows every option ticked.
function FilterChecklist<T extends string | number>({
  items,
  value,
  onValueChange,
  getLabel,
  title,
  renderItem
}: Props<T>) {
  const active = value.length > 0;
  const toggle = (item: T, checked: boolean) => {
    // With no filter every option shows ticked, so unticking one starts from the full list.
    const current = active ? value : items;
    // Keep the list's own order, whatever order the user ticked them in.
    const next = items.filter(candidate =>
      candidate === item ? checked : current.includes(candidate)
    );
    // Every option ticked filters nothing, so fold it back into "no filter".
    onValueChange(next.length === items.length ? [] : next);
  };

  const options = (
    <>
      {items.map(item => (
        <FilterOption
          key={item}
          checked={!active || value.includes(item)}
          onCheckedChange={checked => toggle(item, checked)}
        >
          {renderItem ? renderItem(item) : getLabel(item)}
        </FilterOption>
      ))}
      <Separator />
      <Button
        type='button'
        variant='ghost'
        size='sm'
        disabled={!active}
        onClick={() => onValueChange([])}
        className='justify-start'
      >
        Show all
      </Button>
    </>
  );

  if (!title) return options;

  return (
    <FieldSet className='gap-1'>
      <FieldLegend className='mb-0 px-1.5'>{title}</FieldLegend>
      {options}
    </FieldSet>
  );
}

export { FilterChecklist };
