import { EyeIcon, EyeOffIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import type { Input } from './../../input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../input-group';
import { FormControl } from '../form-control';
import { FormDescription } from '../form-description';
import { FormField } from '../form-field';
import { FormHint } from '../form-hint';
import { FormItem } from '../form-item';
import { FormLabel } from '../form-label';
import { FormMessage } from '../form-message';
import { useFormContext } from '../form-provider';

export type PasswordInputProps = ComponentProps<typeof Input>;

const PasswordInput = ({ type, ref, ...props }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  const toggle = () => {
    setVisible(!visible);
  };

  return (
    <InputGroup>
      <InputGroupInput
        id='inline-end-input'
        type={visible ? 'text' : 'password'}
        ref={ref}
        required
        {...props}
      />
      <InputGroupAddon
        align='inline-end'
        onClick={toggle}
        className='cursor-pointer disabled:cursor-not-allowed'
      >
        {visible ? <EyeIcon /> : <EyeOffIcon />}
      </InputGroupAddon>
    </InputGroup>
  );
};

export type FormPasswordProps = Omit<ComponentProps<typeof PasswordInput>, 'name'> & {
  name: string;
  label?: ReactNode;
};

// Text input field
export const FormPassword = ({ name, label, required, ref, ...props }: FormPasswordProps) => {
  const { control, isLoading, isSubmitting } = useFormContext();
  // PasswordInput hardcodes a native `required` shorthand ahead of its own `{...props}` spread,
  // so an undefined `required` here would blank that shorthand out once spread through -- coerce
  // to an explicit boolean before it reaches PasswordInput.
  const isRequired = required ?? false;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, ...field }, fieldState: { error } }) => (
        <FormItem className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <FormLabel required={isRequired} children={label} />
            <FormHint />
          </div>
          <FormControl>
            <PasswordInput
              {...field}
              {...props}
              disabled={isLoading || isSubmitting || props.disabled}
              value={value ?? ''}
              ref={ref}
              required={isRequired}
              aria-required={isRequired}
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

export { PasswordInput };
