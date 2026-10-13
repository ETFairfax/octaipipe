import { Link } from '@tanstack/react-router';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@workspace/ui/components';
import { NAV_ITEMS } from './nav-items.ts';

// The classes SidebarMenuButton's own `data-active:` variants apply. Spelled out here because
// TanStack's `activeProps` is what decides when a link is active, and it merges className onto
// the rendered element rather than flipping the button's `isActive` prop.
const ACTIVE_LINK = 'bg-sidebar-accent font-medium text-sidebar-accent-foreground';

export function SidebarNav() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>ACE</SidebarGroupLabel>
      <SidebarMenu>
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <SidebarMenuItem key={to}>
            <SidebarMenuButton
              tooltip={label}
              render={<Link to={to} activeProps={{ className: ACTIVE_LINK }} />}
            >
              <Icon />
              <span>{label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
