import { AlertCircleIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';

type ErrorAlertProps = {
  message: string;
  description?: string;
  // Rendered below the description, e.g. a retry button.
  children?: ReactNode;
};

// The destructive `Alert` with its icon and title already composed, for the common "something
// failed" case. Use `Alert` directly for other variants or a different layout.
function ErrorAlert({ message, description, children }: ErrorAlertProps) {
  return (
    <Alert variant='destructive'>
      <AlertCircleIcon aria-hidden='true' />
      <AlertTitle>{message}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      {children && <div className='col-start-2 mt-2'>{children}</div>}
    </Alert>
  );
}

export type { ErrorAlertProps };
export { ErrorAlert };
