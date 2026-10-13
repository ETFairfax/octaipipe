import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { FormCancellationDialog } from './form-cancellation-dialog';
import { useFormContext } from './form-context';
import { FormNavigationPrompt } from './form-navigation-prompt';

type FormCancellationContextType = {
  invokeCancel: () => void;
};

export const FormCancellationContext = createContext<FormCancellationContextType | null>(null);

export const useFormCancellationContext = () => {
  const context = useContext(FormCancellationContext);
  if (!context) throw Error('useFormCancellationContext must be used within a FormProvider');
  return context;
};

type FormCancellationProviderProps = {
  children: ReactNode;
};

export const FormCancellationProvider = ({ children }: FormCancellationProviderProps) => {
  const {
    formState: { isDirty },
    unsavedChangesGuard,
    onCancel
  } = useFormContext();

  const guardedByRouter = unsavedChangesGuard !== 'dialog';
  const [cancellationPromptOpen, setCancellationPromptOpen] = useState(false);

  const onConfirmCancel = () => {
    setCancellationPromptOpen(false);
    onCancel?.();
  };

  const onCancelCancel = () => {
    setCancellationPromptOpen(false);
  };

  // With the router guard this only calls `onCancel`: it must navigate, and the blocker prompts.
  const invokeCancel = useCallback(() => {
    if (!guardedByRouter && isDirty) {
      setCancellationPromptOpen(true);
    } else {
      onCancel?.();
    }
  }, [guardedByRouter, isDirty, onCancel]);

  const value = useMemo(() => ({ invokeCancel }), [invokeCancel]);

  return (
    <FormCancellationContext.Provider value={value}>
      {children}
      {guardedByRouter ? (
        <FormNavigationPrompt />
      ) : (
        <FormCancellationDialog
          open={cancellationPromptOpen}
          onConfirm={onConfirmCancel}
          onCancel={onCancelCancel}
        />
      )}
    </FormCancellationContext.Provider>
  );
};
