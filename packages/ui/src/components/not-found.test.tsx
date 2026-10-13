import { render, screen } from '@testing-library/react';
import { NotFound } from '@workspace/ui/components/not-found';
import { afterEach, describe, expect, it } from 'vitest';

describe('NotFound', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a page-not-found message', () => {
    render(<NotFound />);

    expect(screen.getByText('Page not found')).not.toBeNull();
    expect(screen.getByText("The page you're looking for doesn't exist.")).not.toBeNull();
  });
});
