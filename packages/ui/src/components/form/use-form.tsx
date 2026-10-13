import { zodResolver } from '@hookform/resolvers/zod';
import { forEach, keys, omit } from 'es-toolkit/compat';
import { useEffect, useRef } from 'react';
import type {
  DefaultValues,
  FieldValues,
  Path,
  Resolver,
  UseFormProps,
  UseFormReturn
} from 'react-hook-form';
import { useForm as useReactHookForm } from 'react-hook-form';
import type { z } from 'zod';

interface Options<FieldValuesType extends FieldValues = FieldValues>
  extends UseFormProps<FieldValuesType> {
  schema: z.ZodObject;
}

type ReturnType<FieldValuesType extends FieldValues = FieldValues> =
  UseFormReturn<FieldValuesType> & {
    revalidateTouchedFields: () => Promise<void>;
    resetNot: (key: keyof FieldValuesType) => void;
  };

/******************************************************************************
 * Ensure this is used with a useMemo block for default Values.
 * For example:
 *
 * const form = useForm<ClientFormSchema>({
 *   schema,
 *   defaultValues: useMemo(
 *     () => ({
 *       name: client?.attributes.name ?? null,
 *       surname: client?.attributes.surname ?? null
 *     }),
 *     [client]
 *   )
 * });
 ******************************************************************************/
export const useForm = <FieldValuesType extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  ...rest
}: Options<FieldValuesType>): ReturnType<FieldValuesType> => {
  const form = useReactHookForm<FieldValuesType>({
    // schema is deliberately untyped against FieldValuesType (callers pass any object schema
    // alongside their own form type), so zodResolver's inferred output can't be statically
    // verified against it.
    resolver: zodResolver(schema) as Resolver<FieldValuesType>,
    mode: 'onBlur',
    defaultValues,
    ...rest
  });

  const { trigger, formState, resetField } = form;

  const revalidateTouchedFields = async () => {
    await trigger(keys(formState.touchedFields) as Path<FieldValuesType>[]);
  };

  const resetNot = (key: keyof FieldValuesType) => {
    forEach(keys(omit(formState.defaultValues, key)), field => {
      resetField(field as Path<FieldValuesType>);
    });
  };

  const {
    reset,
    formState: { isDirty }
  } = form;

  const initialized = useRef(false);

  // Reset the form when the it's not dirty and defaultValues changes (ignoring initial render)
  useEffect(() => {
    if (initialized.current) {
      if (!isDirty) {
        reset(defaultValues as DefaultValues<FieldValuesType> | undefined);
      }
    } else {
      initialized.current = true;
    }
  }, [defaultValues]);

  return { ...form, revalidateTouchedFields, resetNot };
};
