import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { FormButtonsProps } from './form-buttons';
import type { UnsavedChangesGuard } from './form-context';

export type BaseFormProps<SubmissionType extends FieldValues> = FormButtonsProps & {
  id?: string;
  unsavedChangesGuard?: UnsavedChangesGuard;
  isLoading: boolean;
  isSubmitting: boolean;
  onCancel?: () => void;
  onSubmit: (submission: SubmissionType) => void;
  wrapper?: (children: ReactNode) => ReactNode;
};
