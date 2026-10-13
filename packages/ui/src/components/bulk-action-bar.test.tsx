import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BulkActionBar } from './bulk-action-bar';

describe('BulkActionBar', () => {
  afterEach(cleanup);

  it('shows no bar while nothing is selected', () => {
    const { queryByRole } = render(<BulkActionBar count={0} onClear={vi.fn()} />);

    expect(queryByRole('group', { name: 'Bulk actions' })).toBeNull();
  });

  it('shows the actions once rows are selected', () => {
    const { getByRole } = render(
      <BulkActionBar count={3} onClear={vi.fn()}>
        <button type='button'>Archive</button>
      </BulkActionBar>
    );

    expect(getByRole('group', { name: 'Bulk actions' })).toBeTruthy();
    expect(getByRole('button', { name: 'Archive' })).toBeTruthy();
  });

  it('announces the count through a status region that stays mounted', () => {
    const { getByRole, rerender } = render(<BulkActionBar count={0} onClear={vi.fn()} />);
    const status = getByRole('status');

    expect(status.textContent).toBe('');

    rerender(<BulkActionBar count={2} onClear={vi.fn()} />);

    expect(getByRole('status')).toBe(status);
    expect(status.textContent).toBe('2 selected');
  });

  it('clears the selection', () => {
    const onClear = vi.fn();
    const { getByRole } = render(<BulkActionBar count={2} onClear={onClear} />);

    fireEvent.click(getByRole('button', { name: 'Clear selection' }));

    expect(onClear).toHaveBeenCalledOnce();
  });
});
