import { map } from 'es-toolkit/compat';
import type { ComponentProps, ReactNode } from 'react';
import { memo } from 'react';
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from '../../field';
import { RadioGroup, RadioGroupItem } from '../../radio-group';
import { FormControl } from '../form-control';
import { FormDescription } from '../form-description';
import { FormField } from '../form-field';
import { FormHint } from '../form-hint';
import { FormItem } from '../form-item';
import { FormGroupLegend } from '../form-legend';
import { FormMessage } from '../form-message';
import { useFormContext } from '../form-provider';
import { useFormField } from '../use-form-field';

export type FormRadioGroupCardItem = Omit<ComponentProps<typeof RadioGroupItem>, 'children'> & {
  children: ReactNode;
  description?: ReactNode;
};

export type FormRadioGroupCardProps = ComponentProps<typeof RadioGroup> & {
  name: string;
  items: FormRadioGroupCardItem[];
};

// Mirrors FormLabel's htmlFor/onClick wiring (form-label.tsx) so clicking anywhere on the card
// selects its radio, but wraps shadcn's "Choice Card" composition (Field/FieldContent/FieldTitle)
// instead of a bare <Label> -- https://ui.shadcn.com/docs/components/base/radio-group#choice-card.
function ChoiceCardLabel({ onSelect, children }: { onSelect: () => void; children: ReactNode }) {
  const { formItemId } = useFormField();
  return (
    <FieldLabel htmlFor={formItemId} onClick={onSelect}>
      {children}
    </FieldLabel>
  );
}

export const FormRadioGroupCard = memo<FormRadioGroupCardProps>(
  ({ name, items, required, ...props }) => {
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
                  <FormItem key={item.value}>
                    <ChoiceCardLabel onSelect={() => onChange(item.value)}>
                      <Field orientation='horizontal'>
                        <FieldContent>
                          <FieldTitle>{item.children}</FieldTitle>
                          {item.description && (
                            <FieldDescription>{item.description}</FieldDescription>
                          )}
                        </FieldContent>
                        <FormControl>
                          <RadioGroupItem value={item.value} />
                        </FormControl>
                      </Field>
                    </ChoiceCardLabel>
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
  }
);
