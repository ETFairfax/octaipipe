import { cn } from '@workspace/ui/lib/utils';
import type { ComponentProps, ReactNode } from 'react';
import { Textarea } from './../../textarea';
import { FormControl } from '../form-control';
import { FormDescription } from '../form-description';
import { FormField } from '../form-field';
import { FormHint } from '../form-hint';
import { FormItem } from '../form-item';
import { FormLabel } from '../form-label';
import { FormMessage } from '../form-message';
import { useFormContext } from '../form-provider';

export type FormTextAreaProps = Omit<ComponentProps<typeof Textarea>, 'name'> & {
  name: string;
  label?: ReactNode;
};

// TextArea input field
export const FormTextArea = ({
  name,
  label,
  required,
  maxLength,
  ref,
  className,
  ...props
}: FormTextAreaProps) => {
  const { control, isLoading, isSubmitting } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, ...field }, fieldState: { error } }) => {
        const tooMuch = maxLength ? value.length > maxLength : false;

        return (
          <FormItem>
            <div className='flex items-center justify-between'>
              <FormLabel required={required} children={label} />
              <FormHint />
            </div>
            <FormControl>
              <Textarea
                {...field}
                {...props}
                className={cn('mt-2', className)}
                disabled={isLoading || isSubmitting || props.disabled}
                value={value ?? ''}
                ref={ref}
                aria-required={required}
                aria-invalid={!!error}
              />
            </FormControl>
            <div className='flex justify-between items-start'>
              <FormMessage />
              <FormDescription
                children={
                  maxLength && (
                    <span className='text-nowrap'>
                      <span className={tooMuch ? 'text-validation-warning-dark' : ''}>
                        {value.length}
                      </span>
                      /<span>{maxLength}</span>
                    </span>
                  )
                }
              />
            </div>
          </FormItem>
        );
      }}
    />
  );
};
