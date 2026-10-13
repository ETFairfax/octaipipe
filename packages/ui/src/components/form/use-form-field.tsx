import { reduce } from 'es-toolkit/compat';
import { useContext, useMemo } from 'react';
import type { ErrorType } from './form-error.type';
import { FormFieldContext } from './form-field-context';
import { FormItemContext } from './form-item-context';
import { useFormContext } from './form-provider';

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const { id } = useContext(FormItemContext);

  const { getFieldState, formState, serverErrors, schema } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { label, hint, description, optional } = useMemo(() => {
    const fieldSchema = schema.shape[fieldContext.name];
    const meta = fieldSchema?.meta();
    return {
      hint: meta?.hint as string | undefined,
      description: meta?.description as string | undefined,
      optional: fieldSchema?.isOptional(), // Is the field optional?
      label: (meta?.label as string | undefined) ?? '' // Has the field be provided a custom label (children)? If not get the label from schema label
    };
  }, [schema.shape, fieldContext.name]);

  const fieldServerErrors = useMemo(
    () =>
      reduce<ErrorType, ErrorType[]>(
        serverErrors?.data.errors,
        (acc, current) =>
          new RegExp(`^/data/attributes/${fieldContext.name}$`, 'i').test(
            current.source?.pointer || ''
          )
            ? [...acc, current]
            : acc,
        []
      ),
    [fieldContext.name, serverErrors?.data.errors]
  );

  return {
    id,
    name: fieldContext.name,
    label: label,
    hint,
    description,
    optional,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    formHintId: `${id}-form-item-hint`,
    fieldServerErrors,
    ...fieldState
  };
};

export { useFormField };
