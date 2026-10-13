// The sort part of a list's search state as it appears in the URL. Domain list searches build on it
// (`SortableSearch<MySortField> & { ...their filters }`), so shared list code can tell the sort
// from the filters. A type alias, not an interface, so it stays assignable to `Record<string, unknown>`.
export type SortableSearch<TSortField extends string = string> = {
  sort?: TSortField;
  desc?: boolean;
};
