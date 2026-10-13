import { InfoIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';

type InfoAlertProps = {
  message: string;
  description?: string;
  // Rendered below the description, e.g. a replay or retry button.
  children?: ReactNode;
};

// The blue `info` `Alert` with its icon and title already composed, for neutral status notices
// that are not failures. Use `ErrorAlert` for failures.
function InfoAlert({ message, description, children }: InfoAlertProps) {
  return (
    <Alert variant='info'>
      <InfoIcon aria-hidden='true' />
      <AlertTitle>{message}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      {children && <div className='col-start-2 mt-2'>{children}</div>}
    </Alert>
  );
}

export type { InfoAlertProps };
export { InfoAlert };
