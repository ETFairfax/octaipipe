import { fireEvent, render, screen } from '@testing-library/react';
import { WidgetBoundary } from '@workspace/ui/components/widget-boundary';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let shouldThrow = true;

function Flaky() {
  if (shouldThrow) throw new Error('widget failed');
  return <p>widget ok</p>;
}

describe('WidgetBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('renders children when nothing throws', () => {
    shouldThrow = false;
    render(
      <WidgetBoundary>
        <Flaky />
      </WidgetBoundary>
    );

    expect(screen.getByText('widget ok')).not.toBeNull();
  });

  it('shows an inline fallback and leaves siblings intact when a child throws', () => {
    render(
      <div>
        <p>page content</p>
        <WidgetBoundary name='Billing'>
          <Flaky />
        </WidgetBoundary>
      </div>
    );

    expect(screen.getByText('page content')).not.toBeNull();
    expect(screen.getByText("Billing couldn't load.")).not.toBeNull();
  });

  it('re-renders children after retry', () => {
    render(
      <WidgetBoundary>
        <Flaky />
      </WidgetBoundary>
    );
    shouldThrow = false;

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(screen.getByText('widget ok')).not.toBeNull();
  });

  it('reports the error through onError', () => {
    const onError = vi.fn();
    render(
      <WidgetBoundary onError={onError}>
        <Flaky />
      </WidgetBoundary>
    );

    expect(onError).toHaveBeenCalledOnce();
  });
});
