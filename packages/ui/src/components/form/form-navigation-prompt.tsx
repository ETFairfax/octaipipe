import { useBlocker, useRouter } from '@tanstack/react-router';
import { isEqual } from 'es-toolkit/compat';
import { useEffect, useRef } from 'react';
import { FormCancellationDialog } from './form-cancellation-dialog';
import { useFormContext } from './form-context';

// Checked up front so a missing router fails with an actionable message rather than from inside
// `useBlocker`.
export const FormNavigationPrompt = () => {
  const router = useRouter({ warn: false });
  if (!router) {
    throw Error(
      "FormProvider guards unsaved changes with the router by default, but no router was found. Render it inside a RouterProvider, or pass unsavedChangesGuard='dialog'."
    );
  }

  return <RouterNavigationPrompt />;
};

const RouterNavigationPrompt = () => {
  const {
    formState: { isDirty, isSubmitSuccessful, submitCount },
    getValues
  } = useFormContext();

  // A successful submit leaves the form dirty (unless the caller resets it) and navigation
  // typically follows, so it must not be blocked. `isSubmitSuccessful` stays true until the next
  // submit though, so remember what was saved and block again once the values move away from it.
  const submittedValues = useRef<unknown>(null);
  useEffect(() => {
    submittedValues.current = isSubmitSuccessful ? getValues() : null;
  }, [isSubmitSuccessful, submitCount, getValues]);

  const { status, proceed, reset } = useBlocker({
    shouldBlockFn: () => {
      if (!isDirty) return false;
      const unchangedSinceSubmit =
        isSubmitSuccessful &&
        submittedValues.current !== null &&
        isEqual(getValues(), submittedValues.current);
      return !unchangedSinceSubmit;
    },
    withResolver: true
  });

  return (
    status === 'blocked' && <FormCancellationDialog open onConfirm={proceed} onCancel={reset} />
  );
};
