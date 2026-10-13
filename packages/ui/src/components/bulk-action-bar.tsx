import { XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './button';

type BulkActionBarProps = {
  // Rows the actions will apply to. The bar is hidden at zero.
  count: number;
  onClear: () => void;
  // The actions, as `Button`s (`variant='ghost'` suits the dark bar).
  children?: ReactNode;
};

// A bar floating at the bottom of the viewport for acting on a selection, so it stays in reach
// however far the list is scrolled. It doesn't take focus or block the page.
//
// The status region is always mounted: screen readers skip a live region that appears with its text
// already in it, so it has to exist before the first row is selected. The visible count is hidden
// from them so the change is announced once.
function BulkActionBar({ count, onClear, children }: BulkActionBarProps) {
  return (
    <>
      <div role='status' className='sr-only'>
        {count > 0 ? `${count} selected` : ''}
      </div>
      {count > 0 && (
        <div className='pointer-events-none fixed inset-x-0 top-2 z-20 flex justify-center'>
          <fieldset
            aria-label='Bulk actions'
            className='pointer-events-auto flex items-center gap-1 rounded-lg bg-foreground px-2 py-1.5 text-background shadow-lg'
          >
            <span className='px-2 text-xs font-medium' aria-hidden='true'>
              {count} selected
            </span>
            {children}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label='Clear selection'
              onClick={onClear}
            >
              <XIcon aria-hidden='true' />
            </Button>
          </fieldset>
        </div>
      )}
    </>
  );
}

export { BulkActionBar, type BulkActionBarProps };
