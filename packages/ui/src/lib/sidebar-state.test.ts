import { readSidebarOpen } from '@workspace/ui/lib/sidebar-state';
import { describe, expect, it } from 'vitest';

describe('readSidebarOpen', () => {
  it('is open when no cookie has been written yet', () => {
    expect(readSidebarOpen('')).toBe(true);
  });

  it('is open when other cookies exist but sidebar_state does not', () => {
    expect(readSidebarOpen('theme=dark; consent=1')).toBe(true);
  });

  it('is closed when sidebar_state is false', () => {
    expect(readSidebarOpen('sidebar_state=false')).toBe(false);
  });

  it('is open when sidebar_state is true', () => {
    expect(readSidebarOpen('sidebar_state=true')).toBe(true);
  });

  it('finds sidebar_state among other cookies, whatever its position', () => {
    expect(readSidebarOpen('theme=dark; sidebar_state=false; consent=1')).toBe(false);
    expect(readSidebarOpen('sidebar_state=false; theme=dark')).toBe(false);
  });

  // A cookie whose *name* merely ends in `sidebar_state` is a different cookie entirely.
  it('does not match a different cookie whose name ends the same way', () => {
    expect(readSidebarOpen('app_sidebar_state=false')).toBe(true);
  });
});
