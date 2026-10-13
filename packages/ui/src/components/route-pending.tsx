import { Spinner } from '@workspace/ui/components/spinner';

function RoutePending() {
  return (
    <div className='flex flex-1 items-center justify-center p-8'>
      <Spinner className='size-6' />
    </div>
  );
}

export { RoutePending };
