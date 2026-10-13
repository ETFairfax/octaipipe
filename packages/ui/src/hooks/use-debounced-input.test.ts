import { act, renderHook } from '@testing-library/react';
import { useDebouncedInput } from '@workspace/ui/hooks/use-debounced-input';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useDebouncedInput', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('commits once after the user pauses typing', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useDebouncedInput({ value: '', onCommit }));

    act(() => result.current.onTextChange('pu'));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.onTextChange('pump'));
    expect(result.current.text).toBe('pump');
    expect(onCommit).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    expect(onCommit).toHaveBeenCalledExactlyOnceWith('pump');
  });

  it('keeps typing that happens while its own commit is still round-tripping', () => {
    const onCommit = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useDebouncedInput({ value, onCommit }), {
      initialProps: { value: '' }
    });

    act(() => result.current.onTextChange('a'));
    act(() => vi.advanceTimersByTime(300));
    expect(onCommit).toHaveBeenLastCalledWith('a');

    // The user keeps typing before the router hands the committed value back.
    act(() => result.current.onTextChange('ab'));
    rerender({ value: 'a' });
    expect(result.current.text).toBe('ab');

    act(() => vi.advanceTimersByTime(300));
    expect(onCommit).toHaveBeenLastCalledWith('ab');
  });

  it('adopts an outside change and drops the pending commit', () => {
    const onCommit = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useDebouncedInput({ value, onCommit }), {
      initialProps: { value: 'boiler' }
    });

    act(() => result.current.onTextChange('pump'));
    rerender({ value: 'valve' });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current.text).toBe('valve');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('does not commit after unmount', () => {
    const onCommit = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedInput({ value: '', onCommit }));

    act(() => result.current.onTextChange('pump'));
    unmount();
    act(() => vi.advanceTimersByTime(300));

    expect(onCommit).not.toHaveBeenCalled();
  });
});
