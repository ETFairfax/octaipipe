import { cn } from '@workspace/ui/lib/utils';
import type { ComponentProps } from 'react';
import { useFormField } from './use-form-field';

export const FormDescription = ({ className, children, ...props }: ComponentProps<'p'>) => {
  const { formDescriptionId, description: schemaDescription } = useFormField();

  const description = children ?? schemaDescription;

  return (
    description && (
      <p
        id={formDescriptionId}
        className={cn('text-[0.8rem] text-muted-foreground px-0.5 mt-2 text-right', className)}
        {...props}
      >
        {description}
      </p>
    )
  );
};
