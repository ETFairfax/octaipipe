import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { RouteError } from '@workspace/ui/components/route-error';

// Loader errors are cached by the router, so `reset` alone only re-renders the boundary; the
// loader re-runs only after an invalidate.
export function DefaultErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <RouteError
      error={error}
      onRetry={() => {
        reset();
        void router.invalidate();
      }}
    />
  );
}
