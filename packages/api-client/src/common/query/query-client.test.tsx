import { QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from './query-client.js';

const notify = { success: vi.fn(), error: vi.fn() };

afterEach(() => {
  vi.clearAllMocks();
});

function wrapperFor(client: ReturnType<typeof createQueryClient>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('createQueryClient', () => {
  it('defaults queries.refetchOnWindowFocus to false', () => {
    const client = createQueryClient(undefined, notify);

    expect(client.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });

  it('lets overrides.queries merge over the default', () => {
    const client = createQueryClient({ queries: { retry: false } });

    expect(client.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
    expect(client.getDefaultOptions().queries?.retry).toBe(false);
  });

  it('invalidates a single meta.invalidatesQuery key on settle', async () => {
    const client = createQueryClient(undefined, notify);
    const queryKey = ['thing'];
    const { result: query } = renderHook(
      () => useQuery({ queryKey, queryFn: () => Promise.resolve('initial') }),
      { wrapper: wrapperFor(client) }
    );
    await waitFor(() => expect(query.current.isSuccess).toBe(true));
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const { result: mutation } = renderHook(
      () =>
        useMutation({
          mutationFn: () => Promise.resolve('done'),
          meta: { invalidatesQuery: queryKey }
        }),
      { wrapper: wrapperFor(client) }
    );
    mutation.current.mutate();

    await waitFor(() => expect(mutation.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
  });

  it('invalidates every key when meta.invalidatesQuery is an array', async () => {
    const client = createQueryClient(undefined, notify);
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');
    const keyA = ['a'];
    const keyB = ['b'];

    const { result: mutation } = renderHook(
      () =>
        useMutation({
          mutationFn: () => Promise.resolve('done'),
          meta: { invalidatesQuery: [keyA, keyB] }
        }),
      { wrapper: wrapperFor(client) }
    );
    mutation.current.mutate();

    await waitFor(() => expect(mutation.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: keyA });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: keyB });
  });

  it('does not invalidate anything when meta is absent', async () => {
    const client = createQueryClient(undefined, notify);
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const { result: mutation } = renderHook(
      () => useMutation({ mutationFn: () => Promise.resolve('done') }),
      { wrapper: wrapperFor(client) }
    );
    mutation.current.mutate();

    await waitFor(() => expect(mutation.current.isSuccess).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('notifies success for meta.successMessage and skips it otherwise', async () => {
    const client = createQueryClient(undefined, notify);

    const { result: withMessage } = renderHook(
      () =>
        useMutation({
          mutationFn: () => Promise.resolve('done'),
          meta: { successMessage: 'Saved!' }
        }),
      { wrapper: wrapperFor(client) }
    );
    withMessage.current.mutate();
    await waitFor(() => expect(withMessage.current.isSuccess).toBe(true));
    expect(notify.success).toHaveBeenCalledWith('Saved!');

    const { result: withoutMessage } = renderHook(
      () => useMutation({ mutationFn: () => Promise.resolve('done') }),
      { wrapper: wrapperFor(client) }
    );
    withoutMessage.current.mutate();
    await waitFor(() => expect(withoutMessage.current.isSuccess).toBe(true));
    expect(notify.success).toHaveBeenCalledTimes(1);
  });

  it('notifies error for meta.errorMessage', async () => {
    const client = createQueryClient(undefined, notify);

    const { result: mutation } = renderHook(
      () =>
        useMutation({
          mutationFn: () => Promise.reject(new Error('nope')),
          meta: { errorMessage: 'Could not save' }
        }),
      { wrapper: wrapperFor(client) }
    );
    mutation.current.mutate();

    await waitFor(() => expect(mutation.current.isError).toBe(true));
    expect(notify.error).toHaveBeenCalledWith('Could not save');
  });

  it('composes an app-supplied onSettled after the base invalidation, not instead of it', async () => {
    const invalidatedKeys: unknown[] = [];
    const appOnSettled = vi.fn();
    const client = createQueryClient({
      mutations: {
        onSettled: (...args) => {
          appOnSettled(...args);
          invalidatedKeys.push('app-ran-after-base');
        }
      }
    });
    const queryKey = ['thing'];
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const { result: mutation } = renderHook(
      () =>
        useMutation({
          mutationFn: () => Promise.resolve('done'),
          meta: { invalidatesQuery: queryKey }
        }),
      { wrapper: wrapperFor(client) }
    );
    mutation.current.mutate();

    await waitFor(() => expect(mutation.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
    expect(appOnSettled).toHaveBeenCalled();
  });
});
