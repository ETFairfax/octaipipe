import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from './button';

type NavButtonProps = Omit<ComponentProps<typeof Button>, 'children'> & {
  direction: 'previous' | 'next';
};

// A small icon button that steps backwards or forwards, such as to the previous or next period. Its
// accessible name is the direction unless `aria-label` says otherwise.
function NavButton({ direction, ...props }: NavButtonProps) {
  const Icon = direction === 'previous' ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <Button
      type='button'
      variant='outline'
      size='icon-xs'
      aria-label={direction === 'previous' ? 'Previous' : 'Next'}
      {...props}
    >
      <Icon aria-hidden='true' />
    </Button>
  );
}

export { NavButton, type NavButtonProps };
