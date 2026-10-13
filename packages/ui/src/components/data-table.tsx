import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
  useReactTable
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@workspace/ui/lib/utils';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, SearchXIcon } from 'lucide-react';
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef } from 'react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty';
import { Skeleton } from './skeleton';
import { TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    // Takes a share of any spare table width, in proportion to `size`. Other columns stay at `size`.
    grow?: boolean;
    // Rendered after the header's sort button, e.g. a `ColumnFilter`, so the filter sits over the column.
    filter?: ReactNode;
  }
}

// The header and footer are rows of the table too, so they count towards `aria-rowcount`.
const headerRowCount = 1;
const footerRowCount = 1;
const rowHeight = 40;
// Enough to fill the table's height while loading.
const skeletonRowCount = 15;
// Start loading the next page while the user is still this many rows from the end.
const prefetchThreshold = 10;
const selectColumnId = 'select';

// Selection is kept by row id, so it survives paging in more rows. The header checkbox acts on the
// loaded rows only: the rest of the list isn't on the client to select.
const selectColumn = <TData extends RowData>(
  getRowLabel: (row: TData) => string
): ColumnDef<TData> => ({
  id: selectColumnId,
  size: 40,
  enableSorting: false,
  header: ({ table }) => (
    <Checkbox
      aria-label='Select all loaded rows'
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onCheckedChange={checked => table.toggleAllRowsSelected(checked)}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      aria-label={`Select ${getRowLabel(row.original)}`}
      checked={row.getIsSelected()}
      onCheckedChange={checked => row.toggleSelected(checked)}
    />
  )
});

// A column's `size` is its minimum width. Columns flagged `meta.grow` share any spare room in
// proportion to it, so the table fills a wide container; the rest (badges, dates) keep their size.
const columnStyle = <TData extends RowData>(column: Column<TData, unknown>): CSSProperties => {
  const size = column.getSize();
  return {
    flex: `${column.columnDef.meta?.grow ? size : 0} 0 ${size}px`,
    minWidth: size
  };
};

type DataTableProps<TData extends RowData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
  // Matches across all pages, for the footer's "Showing x of y".
  total: number;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  // Pass both to add a checkbox column. Controlled, so the owner can act on the selection and
  // clear it when the list's filters change.
  // May hold ids that aren't loaded (a filter or refetch dropped them), so the owner should count
  // and act on loaded rows only.
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void;
  // Names a row for its checkbox's accessible label, e.g. the asset's name.
  getRowLabel?: (row: TData) => string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  // The first page of a new list (initial load, or a changed search/filter/sort) is on its way.
  isLoading?: boolean;
  // What the table lists, lower-case plural (e.g. "assets"). Fills in the default empty state and,
  // capitalised, names the scroll area for assistive tech.
  noun?: string;
  // Replaces the default empty state, e.g. a custom `Empty`.
  empty?: ReactNode;
  // A Tailwind height class for the scroll area. The table scrolls inside it, so it needs a bounded
  // height; the rows are virtualized against it.
  height?: string;
};

function DefaultEmpty({ noun }: { noun: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <SearchXIcon aria-hidden='true' />
        </EmptyMedia>
        <EmptyTitle>No {noun} match your search.</EmptyTitle>
        <EmptyDescription>Try a different search term or filter.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

// A table over a server-paged list: the API sorts (`manualSorting`) and the next page loads as the
// user nears the end. The client only ever holds the pages it has loaded, so sorting those locally
// would reorder a partial list. The rows are virtualized, so only the visible ones are in the DOM
// however many pages have been loaded. Column `id`s are what `sorting` reports back.
function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  total,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  getRowLabel = getRowId,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading = false,
  noun = 'results',
  empty,
  height = 'h-[70vh]'
}: DataTableProps<TData>) {
  const scrollRef = useRef<HTMLElement>(null);

  const selectable = rowSelection !== undefined && onRowSelectionChange !== undefined;
  const allColumns = useMemo(
    () => (selectable ? [selectColumn(getRowLabel), ...columns] : columns),
    [selectable, columns, getRowLabel]
  );

  const table = useReactTable({
    data,
    columns: allColumns,
    // TanStack starts numeric columns descending; start every column ascending instead.
    defaultColumn: { sortDescFirst: false },
    state: { sorting, rowSelection: rowSelection ?? {} },
    enableRowSelection: selectable,
    manualSorting: true,
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    onSortingChange: (updater: Updater<SortingState>) =>
      onSortingChange(typeof updater === 'function' ? updater(sorting) : updater),
    onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
      if (!rowSelection || !onRowSelectionChange) return;
      onRowSelectionChange(typeof updater === 'function' ? updater(rowSelection) : updater);
    }
  });
  // Counted from the loaded rows: the selection can still hold ids that were dropped from the list.
  const selectedCount = table.getSelectedRowModel().rows.length;
  const { rows } = table.getRowModel();
  // Skeletons only fill an empty table; with rows already shown, they fade while the reload runs.
  const showSkeleton = isLoading && rows.length === 0;
  const isRefreshing = isLoading && rows.length > 0;
  const showEmpty = !isLoading && rows.length === 0;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 8
  });
  const virtualRows = virtualizer.getVirtualItems();
  const lastVisibleIndex = virtualRows.at(-1)?.index ?? -1;

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && lastVisibleIndex >= rows.length - prefetchThreshold) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, lastVisibleIndex, rows.length, fetchNextPage]);

  // The table stays mounted while a new list loads, so start the new list from the top.
  useEffect(() => {
    if (isLoading && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [isLoading]);

  return (
    <section
      ref={scrollRef}
      // The table scrolls inside this box, so make the box focusable: keyboard users then scroll it
      // with the arrow, Page Up/Down and Home/End keys, and the next page loads as they near the end.
      aria-label={noun.charAt(0).toUpperCase() + noun.slice(1)}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be focusable for keyboard users.
      tabIndex={0}
      className={cn(
        'relative overflow-auto rounded-md border outline-none focus-visible:ring-2 focus-visible:ring-ring [scrollbar-color:var(--border)_transparent] scrollbar-thin',
        height
      )}
    >
      {/* The `Table` component wraps the <table> in its own scroll container, which would stop the
          header sticking to this one. Absolutely positioned rows need a grid/flex layout too. */}
      <table
        data-slot='table'
        // biome-ignore lint/a11y/noRedundantRoles: display: grid makes some browsers drop the implicit table role.
        role='table'
        aria-rowcount={headerRowCount + total + footerRowCount}
        aria-colcount={table.getVisibleLeafColumns().length}
        className='grid min-h-full w-full grid-rows-[auto_1fr_auto] text-xs'
      >
        <TableHeader role='rowgroup' className='sticky top-0 z-10 grid bg-muted'>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} role='row' aria-rowindex={1} className='flex w-full'>
              {headerGroup.headers.map(header => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const SortIcon =
                  sorted === 'asc'
                    ? ArrowUpIcon
                    : sorted === 'desc'
                      ? ArrowDownIcon
                      : ArrowUpDownIcon;
                return (
                  <TableHead
                    key={header.id}
                    role='columnheader'
                    style={columnStyle(header.column)}
                    aria-sort={
                      !canSort
                        ? undefined
                        : sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : 'none'
                    }
                    className='flex shrink-0 items-center'
                  >
                    {canSort ? (
                      <Button
                        type='button'
                        onClick={header.column.getToggleSortingHandler()}
                        aria-label={
                          typeof header.column.columnDef.header === 'string'
                            ? `Sort by ${header.column.columnDef.header}`
                            : undefined
                        }
                        variant='ghost'
                        className='px-0'
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon className='size-3' aria-hidden='true' />
                      </Button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                    {header.column.columnDef.meta?.filter}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody
          role='rowgroup'
          className={cn(
            'relative grid transition-opacity duration-200',
            // Keep the stale rows visible but faded while the new list loads.
            isRefreshing && 'pointer-events-none opacity-40'
          )}
          aria-busy={isLoading}
          style={{ height: showSkeleton || showEmpty ? undefined : virtualizer.getTotalSize() }}
        >
          {showSkeleton &&
            Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
              <TableRow
                key={rowIndex}
                role='row'
                aria-hidden='true'
                className='flex w-full'
                style={{ height: rowHeight }}
              >
                {table.getVisibleLeafColumns().map(column => (
                  <TableCell
                    key={column.id}
                    role='cell'
                    style={columnStyle(column)}
                    className='flex shrink-0 items-center'
                  >
                    <Skeleton className='h-4 w-3/4' />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {showEmpty && (
            <TableRow role='row' className='flex w-full border-0 hover:bg-transparent'>
              <TableCell role='cell' className='flex flex-1 items-center justify-center'>
                {empty ?? <DefaultEmpty noun={noun} />}
              </TableCell>
            </TableRow>
          )}
          {virtualRows.map(virtualRow => {
            const row = rows[virtualRow.index];
            return (
              <TableRow
                key={row.id}
                role='row'
                aria-rowindex={headerRowCount + virtualRow.index + 1}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                className='absolute flex w-full'
                style={{ height: rowHeight, transform: `translateY(${virtualRow.start}px)` }}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    role='cell'
                    style={columnStyle(cell.column)}
                    className='flex shrink-0 items-center truncate'
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter role='rowgroup' className='sticky bottom-0 z-10 grid bg-muted'>
          <TableRow
            role='row'
            aria-rowindex={headerRowCount + total + footerRowCount}
            className='flex w-full'
          >
            <TableCell role='cell' className='text-muted-foreground' aria-live='polite'>
              {isLoading
                ? 'Loading…'
                : `Showing ${data.length} of ${total}${selectedCount > 0 ? ` · ${selectedCount} selected` : ''}${isFetchingNextPage ? ' · loading more…' : ''}`}
            </TableCell>
          </TableRow>
        </TableFooter>
      </table>
    </section>
  );
}

export { DataTable, type DataTableProps };
