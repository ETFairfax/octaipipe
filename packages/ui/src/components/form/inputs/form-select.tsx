import type { SelectItemProps } from '@base-ui/react';
import { map } from 'es-toolkit/compat';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../select';
import { Skeleton } from '../../skeleton';
import { FormControl } from '../form-control';
import { FormDescription } from '../form-description';
import { FormField } from '../form-field';
import { FormHint } from '../form-hint';
import { FormItem } from '../form-item';
import { FormLabel } from '../form-label';
import { FormMessage } from '../form-message';
import { useFormContext } from '../form-provider';

export type FormSelectProps = Omit<ComponentProps<typeof Select>, 'name'> & {
  name: string;
  items: SelectItemProps[];
  ref?: ComponentProps<typeof SelectTrigger>['ref'];
};

export const FormSelect = ({
  name,
  items,
  required,
  onValueChange,
  ref,
  ...props
}: FormSelectProps) => {
  const { control, isLoading, isSubmitting } = useFormContext();
  const [open, setIsOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onBlur, onChange }, fieldState: { error } }) => (
        <FormItem>
          <div className='flex items-start justify-between'>
            <FormLabel required={required} />
            <FormHint />
          </div>

          {isLoading ? (
            <Skeleton className='h-12 w-full' />
          ) : (
            <Select
              {...props}
              items={items}
              aria-required={required}
              defaultValue={props.value}
              value={value}
              open={open}
              onOpenChange={setIsOpen}
              onValueChange={(value, eventDetails) => {
                onChange(value);
                onValueChange?.(value, eventDetails);
              }}
            >
              <FormControl>
                <SelectTrigger
                  className='w-full mt-2'
                  ref={ref}
                  disabled={isLoading || isSubmitting || props.disabled}
                  aria-invalid={!!error}
                  // variant={error ? 'error' : undefined}
                  onBlur={() => {
                    // When used within a DialogContent, this causes it to validate the component immediately; prematurely showing validation errors :\
                    if (!open) {
                      onBlur();
                    }
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {map(items, item => (
                  <SelectItem key={item.value} {...item} />
                ))}
              </SelectContent>
            </Select>
          )}

          <FormDescription />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
