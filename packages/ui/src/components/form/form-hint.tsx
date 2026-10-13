import { cn } from '@workspace/ui/lib/utils';
import { HelpCircleIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { useFormField } from './use-form-field';

export const FormHint = ({ className, children, ...props }: ComponentProps<'p'>) => {
  const { formHintId, hint: schemaHint } = useFormField();

  const hint = children ?? schemaHint ?? '';

  return (
    hint && (
      <p
        id={formHintId}
        className={cn('text-[0.8rem] text-muted-foreground', className)}
        {...props}
      >
        {hint && (
          <Popover>
            <PopoverTrigger className='text-validation-info-dark text-lg'>
              <HelpCircleIcon fontSize='small' />
            </PopoverTrigger>
            <PopoverContent
              className='p-2.5 bg-validation-info-tint border-validation-info-dark text-foreground'
              side='left'
            >
              {hint}
            </PopoverContent>
          </Popover>
        )}
      </p>
    )
  );
};
