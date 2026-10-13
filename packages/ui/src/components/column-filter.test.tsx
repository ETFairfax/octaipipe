import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ColumnFilter } from './column-filter';

const labels = { 1: 'One', 2: 'Two', 3: 'Three' } as const;
type Key = keyof typeof labels;

const renderFilter = (value: Key[], onValueChange = vi.fn()) =>
  render(
    <ColumnFilter<Key>
      items={[1, 2, 3]}
      value={value}
      onValueChange={onValueChange}
      label='number'
      getLabel={key => labels[key]}
    />
  );

describe('ColumnFilter', () => {
  // Base UI's checkbox builds a PointerEvent on click, which jsdom lacks.
  beforeAll(() => vi.stubGlobal('PointerEvent', MouseEvent));
  afterEach(cleanup);

  const open = (view: ReturnType<typeof renderFilter>) =>
    fireEvent.click(view.getByLabelText('Filter by number'));

  it('adds an item, keeping the list order', () => {
    const onValueChange = vi.fn();
    const view = renderFilter([3], onValueChange);

    open(view);
    fireEvent.click(view.getByRole('checkbox', { name: 'One' }));

    expect(onValueChange).toHaveBeenLastCalledWith([1, 3]);
  });

  it('removes an item', () => {
    const onValueChange = vi.fn();
    const view = renderFilter([1, 3], onValueChange);

    open(view);
    fireEvent.click(view.getByRole('checkbox', { name: 'One' }));

    expect(onValueChange).toHaveBeenLastCalledWith([3]);
  });

  it('folds back into "no filter" when every item is ticked', () => {
    const onValueChange = vi.fn();
    const view = renderFilter([1, 3], onValueChange);

    open(view);
    fireEvent.click(view.getByRole('checkbox', { name: 'Two' }));

    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it('shows every item ticked when there is no filter', () => {
    const view = renderFilter([]);

    open(view);

    for (const name of ['One', 'Two', 'Three']) {
      expect(view.getByRole('checkbox', { name }).getAttribute('aria-checked')).toBe('true');
    }
  });

  it('unticking an item with no filter keeps the others', () => {
    const onValueChange = vi.fn();
    const view = renderFilter([], onValueChange);

    open(view);
    fireEvent.click(view.getByRole('checkbox', { name: 'Two' }));

    expect(onValueChange).toHaveBeenLastCalledWith([1, 3]);
  });

  it('clears the filter from the "Show all" button', () => {
    const onValueChange = vi.fn();
    const view = renderFilter([1, 3], onValueChange);

    open(view);
    fireEvent.click(view.getByRole('button', { name: 'Show all' }));

    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it('disables "Show all" when there is no filter', () => {
    const view = renderFilter([]);

    open(view);

    expect(view.getByRole('button', { name: 'Show all' }).hasAttribute('disabled')).toBe(true);
  });
});
