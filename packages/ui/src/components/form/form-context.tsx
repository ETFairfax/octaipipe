import { createContext, useContext } from 'react';
import { useFormContext as useRhfFormContext } from 'react-hook-form';
import type { z } from 'zod';
import type { ErrorResponse } from './form-error.type';

// Who protects a dirty form from being abandoned: the router's navigation blocker (the default,
// for forms whose Cancel/close navigates away) or the form's own confirm dialog (for forms that
// close in place, or render outside a router).
export type UnsavedChangesGuard = 'router' | 'dialog';

export type FormContextType = {
  isLoading: boolean;
  isSubmitting: boolean;
  schema: z.ZodObject;
  serverErrors?: ErrorResponse | null;
  unsavedChangesGuard?: UnsavedChangesGuard;
  onCancel?: () => void;
};

export const FormContext = createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) throw Error('useForm must be used within a FormProvider');

  const form = useRhfFormContext();

  return { ...context, ...form };
};
