import type { ComponentProps } from 'react';
import { FormControl } from '../form-control';
import { FormDescription } from '../form-description';
import { FormField } from '../form-field';
import { FormItem } from '../form-item';
import { FormMessage } from '../form-message';
import { useFormContext } from '../form-provider';

export type FormHiddenProps = Omit<ComponentProps<'input'>, 'name' | 'type'> & {
  name: string;
};

// Text input field
export const FormHidden = ({ name, required, ref, ...props }: FormHiddenProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, ...field } }) => (
        <FormItem>
          <FormControl>
            <input
              {...field}
              {...props}
              disabled={props.disabled}
              type='hidden'
              autoComplete='off'
              value={value ?? ''}
              ref={ref}
            />
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
