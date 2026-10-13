import { render, screen } from '@testing-library/react';
import { RoutePending } from '@workspace/ui/components/route-pending';
import { afterEach, describe, expect, it } from 'vitest';

describe('RoutePending', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a loading indicator', () => {
    render(<RoutePending />);

    expect(screen.getByRole('status', { name: 'Loading' })).not.toBeNull();
  });
});
