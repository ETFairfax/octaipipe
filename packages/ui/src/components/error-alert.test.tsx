import { render, screen } from '@testing-library/react';
import { ErrorAlert } from '@workspace/ui/components/error-alert';
import { afterEach, describe, expect, it } from 'vitest';

describe('ErrorAlert', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('announces the message as an alert', () => {
    render(<ErrorAlert message='Could not load assets.' />);

    expect(screen.getByRole('alert').textContent).toBe('Could not load assets.');
  });

  it('shows the description when given', () => {
    render(<ErrorAlert message='Could not load assets.' description='Try again later.' />);

    expect(screen.getByText('Try again later.')).not.toBeNull();
  });

  it('renders children inside the alert', () => {
    render(
      <ErrorAlert message='Could not load assets.'>
        <button type='button'>Retry</button>
      </ErrorAlert>
    );

    expect(screen.getByRole('alert').contains(screen.getByRole('button', { name: 'Retry' }))).toBe(
      true
    );
  });
});
