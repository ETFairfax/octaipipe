import { fireEvent, render } from '@testing-library/react';
import { ThemeProvider } from '@workspace/ui/components/theme-provider';
import { ThemeToggle } from '@workspace/ui/components/theme-toggle';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function renderToggle(defaultTheme: 'light' | 'dark' | 'system') {
  const { container } = render(
    <ThemeProvider defaultTheme={defaultTheme} storageKey={`theme-toggle-test-${defaultTheme}`}>
      <ThemeToggle />
    </ThemeProvider>
  );
  const button = container.querySelector('button');
  if (button === null) {
    throw new Error('expected ThemeToggle to render a button');
  }
  return button;
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false
      }) as unknown as MediaQueryList;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows the sun icon for light, moon for dark, monitor for system', () => {
    expect(renderToggle('light').querySelector('.lucide-sun')).not.toBeNull();
    expect(renderToggle('dark').querySelector('.lucide-moon')).not.toBeNull();
    expect(renderToggle('system').querySelector('.lucide-monitor')).not.toBeNull();
  });

  it('cycles light -> dark -> system -> light on repeated clicks', () => {
    const button = renderToggle('light');

    expect(button.querySelector('.lucide-sun')).not.toBeNull();
    fireEvent.click(button);
    expect(button.querySelector('.lucide-moon')).not.toBeNull();
    fireEvent.click(button);
    expect(button.querySelector('.lucide-monitor')).not.toBeNull();
    fireEvent.click(button);
    expect(button.querySelector('.lucide-sun')).not.toBeNull();
  });
});
