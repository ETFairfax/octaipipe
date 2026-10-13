# UI

## Language

**Cookie Banner**:
The Drawer-based component presenting Necessary and Other Cookies with a single Accept action.
_Avoid_: Cookie notice, consent popup

**Necessary Cookie**:
A cookie required for core site function. Always enabled; not user-toggleable, and therefore
deliberately **not** an entry in the Cookie List. The Sidebar's `sidebar_state` cookie is one:
a first-party record of whether the user collapsed the sidebar, with no tracking function and
nothing to consent to.
_Avoid_: Essential cookie, strictly necessary cookie

**Other Cookie**:
An entry in the Cookie List. Defaults on, but the user can individually switch it off in the Cookie Banner.
_Avoid_: Optional cookie, non-essential cookie

**Cookie List**:
The single shared list of Other Cookies (`id`, `name`, `description` per entry), used identically by every app.
_Avoid_: Cookie catalog, cookie config

**Consent Record**:
The JSON object persisted to `localStorage` capturing when consent was given, when it expires, and the user's choice for each Other Cookie.
_Avoid_: Consent state, cookie preferences

**Cookie Re-prompt**:
Showing the Cookie Banner again to a user who has already given a Consent Record. Triggered either by the Consent Record expiring (every choice resets to its default) or by the Cookie List containing an Other Cookie the Consent Record has no choice for (only that one defaults on; every other choice is preserved).
_Avoid_: Re-ask, re-consent

**Field** (`components/field.tsx`):
A layout-only, RHF-agnostic presentation primitive. No react-hook-form or schema binding — just structure and spacing. Composes alongside Form Fields; not a competing system.
_Avoid_: Using "Field" when a Form Field is meant

**Form Field** (`components/form/`):
The react-hook-form- and zod-schema-bound field family, driven by a `FormProvider` further up the tree. Label/hint/description text is read from the field's zod `.meta()`, not passed as props — schema is the source of truth for field copy.
_Avoid_: Passing `label`/hint text as a prop instead of `.meta()`; calling it just "Field" (collides with the layout primitive above)

**Unsaved Changes Guard** (`unsavedChangesGuard` on `FormProvider`):
What stops a dirty form being abandoned. `'router'` (the default) uses the router blocker, so Cancel, Escape, the close button and browser Back all prompt once; it needs a router, and `FormProvider` throws without one. Right after a successful submit navigation is allowed, and it is guarded again as soon as the values differ from what was saved. `'dialog'` has the form show its own confirm dialog on Cancel or close; use it for a form that closes in place or renders outside a router.
Form containers (`FormSheet`, `FormDialog`) are controlled by the caller and close only through the guard; they take no `onOpenChange`.
_Avoid_: Describing it by container ("page", "sheet"); it is chosen by how the form closes, not by what holds it.

**Data Table** (`components/data-table.tsx`):
A table over a server-paged list. The API sorts (`manualSorting`), the next page loads as the user nears the end, and rows are virtualized so the DOM stays small however many pages are loaded. It never sorts or filters the rows it holds, because they are only part of the list. The `noun` prop names the rows in the table's accessible label and empty state.
_Avoid_: Sorting or filtering client-side inside it; using it for a small, fully loaded list.

**Column Filter** (`components/column-filter.tsx`):
A controlled checkbox-list filter for one column, opened from an icon in the column's header (`meta.filter` on a `DataTable` column). An empty `value` means "no filter", not "nothing matches"; the "All" row stands for it.

**Timeline Calendar** (`components/timeline-calendar/`):
A horizontal timeline with one row per entity and events placed by when they happen. It is given only a `view`, a `date` and the items, each mapped to a row only when drawn (`getRow`); the range, headers and captions are derived from those (`timeline-utils.ts`). A year is not a calendar year but a run of whole weeks from the Monday of `date`'s week. Rows are virtualized and paged like `DataTable`: a different period is a different list, so the caller loads rows for the period `getTimelineRange` gives. Bar colour comes from the event's `className`; status palettes belong to the caller. Selection is reported through callbacks and carries no href, so what it means (navigate, open a sheet) is the caller's.
_Avoid_: Confusing it with `Calendar`, the date picker; passing it header or range data.

**Error Alert** (`components/error-alert.tsx`):
The standard inline failure message for a query that can't render its content.

**Debounced Input** (`hooks/use-debounced-input.ts`):
Local text state for an input whose committed value lives elsewhere, normally the URL. Typing stays local and the value is committed after a pause, so there is no history entry or request per keystroke. A change to the committed value from outside (back/forward, a shared link) replaces the text; the hook's own commit coming back does not, because the user may have typed further in the meantime.
_Avoid_: Writing keystrokes straight to the URL.
