import { cn } from '@workspace/ui/lib/utils';
import { isUndefined } from 'es-toolkit/compat';
import type React from 'react';
import { memo, useMemo } from 'react';
import { useFormField } from './use-form-field';

export type FormGroupLegendProps = React.HTMLAttributes<HTMLLegendElement> & {
  id: string;
  required?: boolean;
};

export const FormGroupLegend = memo<FormGroupLegendProps>(
  ({ className, children, required, ...props }) => {
    const { label, optional } = useFormField();

    const isOptional = useMemo(
      () => required === false || ((isUndefined(required) && optional) ?? false),
      [optional, required]
    );

    return (
      <legend
        data-optional={isOptional}
        className={cn(
          "font-medium pb-2 data-[optional=false]:after:content-['*'] after:text-neutral-light after:text-sm after:ml-1",
          className
        )}
        {...props}
      >
        {children ?? label}
      </legend>
    );
  }
);

FormGroupLegend.displayName = 'FormGroupLegend';
