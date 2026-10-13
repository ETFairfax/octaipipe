import { map } from 'es-toolkit/compat';
import type { ComponentProps } from 'react';
import { memo } from 'react';
import { RadioGroup, RadioGroupItem } from './../../radio-group';
import { FormControl } from '../form-control';
import { FormDescription } from '../form-description';
import { FormField } from '../form-field';
import { FormHint } from '../form-hint';
import { FormItem } from '../form-item';
import { FormLabel } from '../form-label';
import { FormGroupLegend } from '../form-legend';
import { FormMessage } from '../form-message';
import { useFormContext } from '../form-provider';

export type FormRadioGroupProps = ComponentProps<typeof RadioGroup> & {
  name: string;
  items: ComponentProps<typeof RadioGroupItem>[];
};

export const FormRadioGroup = memo<FormRadioGroupProps>(({ name, items, required, ...props }) => {
  const { control, isLoading, isSubmitting } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange, ref, ...field }, fieldState: { error } }) => (
        <FormItem>
          <div className='flex items-center justify-between mb-2'>
            <FormGroupLegend required={required} id={name} />
            <FormHint />
          </div>
          <FormControl>
            <RadioGroup
              {...field}
              {...props}
              aria-required={required}
              defaultValue={props.value === null ? undefined : value}
              disabled={isLoading || isSubmitting || props.disabled}
              data-error={!!error}
              onValueChange={onChange}
              value={value}
            >
              {map(items, item => (
                <FormItem key={item.value} className='flex items-center gap-3 pl-4'>
                  <FormControl>
                    <RadioGroupItem value={item.value} />
                  </FormControl>
                  <FormLabel
                    className='font-normal'
                    required={false}
                    onClick={() => onChange(item.value)}
                  >
                    {item.children}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
