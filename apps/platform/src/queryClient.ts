import { createQueryClient } from '@workspace/api-client';
import { toast } from '@workspace/ui/components';

// One QueryClient shared by the router context (loaders) and QueryProvider (components).
export const queryClient = createQueryClient(undefined, {
  success: title => toast.add({ type: 'success', title }),
  error: title => toast.add({ type: 'error', title })
});
