import { isUndefined } from 'es-toolkit/compat';
import { useMemo } from 'react';
import { Label } from '../label';
import { useFormField } from './use-form-field';

export const FormLabel = ({
  className,
  children,
  required,
  ...props
}: React.ComponentProps<typeof Label> & { required?: boolean }) => {
  const { formItemId, label, optional } = useFormField();

  const isOptional = useMemo(
    () => required === false || ((isUndefined(required) && optional) ?? false),
    [optional, required]
  );

  return (
    <Label data-optional={isOptional} className={className} htmlFor={formItemId} {...props}>
      {children ?? label}
    </Label>
  );
};

FormLabel.displayName = 'FormLabel';
