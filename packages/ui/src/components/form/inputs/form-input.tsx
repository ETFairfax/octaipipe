import type { ComponentProps, ReactNode } from 'react';
import { Input } from '../../input';
import { FormControl } from '../form-control';
import { FormDescription } from '../form-description';
import { FormField } from '../form-field';
import { FormHint } from '../form-hint';
import { FormItem } from '../form-item';
import { FormLabel } from '../form-label';
import { FormMessage } from '../form-message';
import { useFormContext } from '../form-provider';

export type FormInputProps = Omit<ComponentProps<typeof Input>, 'name'> & {
  name: string;
  label?: ReactNode;
};

// Text input field
export const FormInput = ({ name, label, required, ref, ...props }: FormInputProps) => {
  const { control, isLoading, isSubmitting } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, ...field }, fieldState: { error } }) => (
        <FormItem className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <FormLabel required={required} children={label} />
            <FormHint />
          </div>
          <FormControl>
            <Input
              {...field}
              {...props}
              disabled={isLoading || isSubmitting || props.disabled}
              value={value ?? ''}
              ref={ref}
              aria-required={required}
              aria-invalid={!!error}
            />
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
