// import { DevTool } from '@hookform/devtools';
import { useMemo } from 'react';
import type { FieldValues, FormProviderProps as RhfFormProviderProps } from 'react-hook-form';
import { FormProvider as RhfFormProvider } from 'react-hook-form';
import { FormCancellationProvider } from './form-cancellation-provider';
import type { FormContextType } from './form-context';
import { FormContext } from './form-context';

export type { FormContextType, UnsavedChangesGuard } from './form-context';
export { FormContext, useFormContext } from './form-context';

type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  // biome-ignore lint/suspicious/noExplicitAny: mirrors react-hook-form's own default
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined
> = RhfFormProviderProps<TFieldValues, TContext, TTransformedValues> & FormContextType;

export const FormProvider = <
  TFieldValues extends FieldValues,
  // biome-ignore lint/suspicious/noExplicitAny: mirrors react-hook-form's own default
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined
>({
  children,
  isLoading,
  isSubmitting,
  schema,
  serverErrors,
  unsavedChangesGuard,
  onCancel,
  ...form
}: FormProviderProps<TFieldValues, TContext, TTransformedValues>) => {
  const context = useMemo(
    () => ({ isLoading, isSubmitting, schema, serverErrors, unsavedChangesGuard, onCancel }),
    [isLoading, isSubmitting, schema, serverErrors, unsavedChangesGuard, onCancel]
  );

  return (
    <FormContext.Provider value={context}>
      <RhfFormProvider {...form}>
        <FormCancellationProvider>{children}</FormCancellationProvider>
        {/* <DevTool control={form.control} placement='bottom-left' /> */}
      </RhfFormProvider>
    </FormContext.Provider>
  );
};
