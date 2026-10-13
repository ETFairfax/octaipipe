import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useScopedSelection } from './use-scoped-selection';

type Search = { term?: string; sort?: string; desc?: boolean };

const renderSelection = (initialSearch: Search) =>
  renderHook(({ search }) => useScopedSelection(search), {
    initialProps: { search: initialSearch }
  });

describe('useScopedSelection', () => {
  it('starts empty and keeps what is selected', () => {
    const { result } = renderSelection({ term: 'a' });

    expect(result.current.rowSelection).toEqual({});
    act(() => result.current.onRowSelectionChange({ one: true }));

    expect(result.current.rowSelection).toEqual({ one: true });
  });

  it('reads as empty once the filters change, and stays empty if they change back', () => {
    const { result, rerender } = renderSelection({ term: 'a' });
    act(() => result.current.onRowSelectionChange({ one: true }));

    rerender({ search: { term: 'b' } });
    expect(result.current.rowSelection).toEqual({});

    rerender({ search: { term: 'a' } });
    expect(result.current.rowSelection).toEqual({});
  });

  it('keeps the selection when only the sort changes', () => {
    const { result, rerender } = renderSelection({ term: 'a' });
    act(() => result.current.onRowSelectionChange({ one: true }));

    rerender({ search: { term: 'a', sort: 'name', desc: true } });

    expect(result.current.rowSelection).toEqual({ one: true });
  });

  it('selects under the new filters after a change', () => {
    const { result, rerender } = renderSelection({ term: 'a' });
    rerender({ search: { term: 'b' } });
    act(() => result.current.onRowSelectionChange({ two: true }));

    expect(result.current.rowSelection).toEqual({ two: true });
  });
});
