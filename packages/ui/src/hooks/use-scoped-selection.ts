import type { RowSelectionState } from '@tanstack/react-table';
import type { SortableSearch } from '@workspace/ui/lib/list-search';
import { useState } from 'react';

// Everything but the sort, which only reorders the matches. A filter added to the search state is
// covered without touching this.
const toMatchKey = ({ sort: _sort, desc: _desc, ...matches }: Search): string =>
  JSON.stringify(matches);

// `Record` is what lets a list with no sort fields of its own, or a plain object literal, pass.
type Search = Record<string, unknown> & SortableSearch;

/**
 * Row selection for a `DataTable` over a list whose matches change with its search state (filters,
 * search term). The selection belongs to the matches it was made under: once the search state
 * matches something else, it reads as empty, so a bulk action can't hit rows the user can no longer
 * see. `sort` and `desc` are ignored, since they only reorder the matches.
 *
 * The reset happens during render rather than in an effect, so a stale selection is never rendered.
 * It is dropped however the search changed (inputs, back button, a shared link), and returning to
 * an earlier search does not bring its selection back. The key is a JSON serialisation, so the same
 * filters in a different key order count as a change.
 *
 * Spread the result onto `DataTable`.
 */
function useScopedSelection(search: Search) {
  const scope = toMatchKey(search);
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [selectionScope, setSelectionScope] = useState(scope);

  // React re-renders straight away when state is set during render, before anything is committed.
  if (selectionScope !== scope) {
    setSelectionScope(scope);
    setSelection({});
  }

  return { rowSelection: selection, onRowSelectionChange: setSelection };
}

export { useScopedSelection };
