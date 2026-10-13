import { cn } from '@workspace/ui/lib/utils';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '../button';
import { useFormCancellationContext } from './form-cancellation-provider';
import { useFormContext } from './form-provider';

export type FormButtonsProps = Omit<ComponentProps<'div'>, 'onSubmit'> & {
  save?: ComponentProps<typeof Button>;
  cancel?: ComponentProps<typeof Button> | false;
  between?: ReactNode;
};

export const FormButtons = ({
  between,
  cancel,
  save,
  children,
  className,
  ...props
}: FormButtonsProps) => {
  const { isLoading, isSubmitting } = useFormContext();
  const { invokeCancel } = useFormCancellationContext();

  return (
    <div className={cn('flex flex-col sm:flex-row gap-2 justify-end', className)} {...props}>
      {cancel !== false && (
        <Button
          variant='secondary'
          type='button'
          onClick={invokeCancel}
          disabled={isSubmitting}
          {...cancel}
        >
          {cancel?.children ?? 'Cancel'}
        </Button>
      )}
      {between}
      <Button variant='default' type='submit' disabled={isLoading || isSubmitting} {...save}>
        {save?.children ?? 'Save'}
      </Button>
      {children}
    </div>
  );
};
