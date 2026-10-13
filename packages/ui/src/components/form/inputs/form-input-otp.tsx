import { type ComponentProps, memo, type ReactNode } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './../../input-otp';
import { FormControl } from '../form-control';
import { FormDescription } from '../form-description';
import { FormField } from '../form-field';
import { FormHint } from '../form-hint';
import { FormItem } from '../form-item';
import { FormLabel } from '../form-label';
import { FormMessage } from '../form-message';
import { useFormContext } from '../form-provider';

export type FormInputOtpProps = Omit<
  ComponentProps<typeof InputOTP>,
  'name' | 'onChange' | 'value' | 'children' | 'render'
> & {
  name: string;
  label?: ReactNode;
};

export const FormInputOtp = memo<FormInputOtpProps>(
  ({ name, label, required, maxLength, ...props }) => {
    const { control, isLoading, isSubmitting } = useFormContext();

    return (
      <FormField
        control={control}
        name={name}
        render={({ field: { value, ...field }, fieldState: { error } }) => (
          <FormItem>
            <div className='flex items-start justify-between'>
              <FormLabel required={required} children={label} />
              <FormHint />
            </div>
            <FormControl>
              <InputOTP
                {...field}
                {...props}
                maxLength={maxLength}
                disabled={isLoading || isSubmitting || props.disabled}
                value={value ?? ''}
                aria-required={required}
                aria-invalid={!!error}
              >
                <InputOTPGroup>
                  {Array.from({ length: maxLength }, (_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);
