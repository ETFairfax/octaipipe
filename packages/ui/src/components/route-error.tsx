import { Button } from '@workspace/ui/components/button';

type RouteErrorProps = {
  error: Error;
  onRetry?: () => void;
};

function RouteError({ error, onRetry }: RouteErrorProps) {
  return (
    <div role='alert' className='flex flex-1 flex-col items-start gap-2'>
      <p className='text-sm font-medium'>Something went wrong</p>
      <p className='text-sm text-muted-foreground'>{error.message}</p>
      {onRetry && (
        <Button variant='outline' size='sm' onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export type { RouteErrorProps };
export { RouteError };
