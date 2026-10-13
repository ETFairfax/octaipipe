import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NavButton } from './nav-button';

describe('NavButton', () => {
  afterEach(cleanup);

  it('is named for its direction', () => {
    const { getByRole } = render(
      <>
        <NavButton direction='previous' />
        <NavButton direction='next' />
      </>
    );

    expect(getByRole('button', { name: 'Previous' })).toBeTruthy();
    expect(getByRole('button', { name: 'Next' })).toBeTruthy();
  });

  it('takes a different name and reports clicks', () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <NavButton direction='next' aria-label='Next month' onClick={onClick} />
    );

    fireEvent.click(getByRole('button', { name: 'Next month' }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
