import { fireEvent, render, screen } from '@testing-library/react';
import { RouteError } from '@workspace/ui/components/route-error';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('RouteError', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows the error message', () => {
    render(<RouteError error={new Error('Boom')} />);

    expect(screen.getByRole('alert')).not.toBeNull();
    expect(screen.getByText('Boom')).not.toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('calls onRetry when the retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<RouteError error={new Error('Boom')} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
