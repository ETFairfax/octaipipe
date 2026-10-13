import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '../query/query-client.js';
import { useAppMutation } from './use-app-mutation.js';

const notify = { success: vi.fn(), error: vi.fn() };

afterEach(() => {
  vi.clearAllMocks();
});

function wrapperFor(client: ReturnType<typeof createQueryClient>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useAppMutation', () => {
  it('is a pure useMutation pass-through: it runs the caller onSuccess', async () => {
    const client = createQueryClient(undefined, notify);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () => useAppMutation(() => Promise.resolve('done'), { onSuccess }),
      { wrapper: wrapperFor(client) }
    );
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledWith('done', undefined, undefined, expect.anything());
  });

  it('does not manage invalidation itself -- forwarded meta reaches the global handler instead', async () => {
    const client = createQueryClient(undefined, notify);
    const queryKey = ['thing'];
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(
      () =>
        useAppMutation(() => Promise.resolve('done'), {
          meta: { invalidatesQuery: queryKey, successMessage: 'Done!' }
        }),
      { wrapper: wrapperFor(client) }
    );
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
    expect(notify.success).toHaveBeenCalledWith('Done!');
  });
});
