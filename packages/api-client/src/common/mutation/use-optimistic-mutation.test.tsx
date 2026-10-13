import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '../query/query-client.js';
import { useOptimisticMutation } from './use-optimistic-mutation.js';

const notify = { success: vi.fn(), error: vi.fn() };

afterEach(() => {
  vi.clearAllMocks();
});

function wrapperFor(client: ReturnType<typeof createQueryClient>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useOptimisticMutation', () => {
  it('optimistically appends the mutated value, then settles without rolling back on success', async () => {
    const client = createQueryClient(undefined, notify);
    const queryKey = ['items'];
    client.setQueryData(queryKey, [{ id: 1 }]);

    const { result } = renderHook(
      () => useOptimisticMutation(vars => Promise.resolve(vars), queryKey),
      { wrapper: wrapperFor(client) }
    );
    result.current.mutate({ id: 2 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(queryKey)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('rolls back to the snapshot on error', async () => {
    const client = createQueryClient(undefined, notify);
    const queryKey = ['items'];
    client.setQueryData(queryKey, [{ id: 1 }]);

    const { result } = renderHook(
      () =>
        useOptimisticMutation<{ id: number }>(() => Promise.reject(new Error('nope')), queryKey),
      { wrapper: wrapperFor(client) }
    );
    result.current.mutate({ id: 2 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData(queryKey)).toEqual([{ id: 1 }]);
  });

  it('forwards caller options (including meta) to the underlying mutation', async () => {
    const client = createQueryClient(undefined, notify);
    const queryKey = ['items'];

    const { result } = renderHook(
      () =>
        useOptimisticMutation<{ id: number }>(vars => Promise.resolve(vars), queryKey, {
          meta: { successMessage: 'Saved!' }
        }),
      { wrapper: wrapperFor(client) }
    );
    result.current.mutate({ id: 2 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notify.success).toHaveBeenCalledWith('Saved!');
  });
});
