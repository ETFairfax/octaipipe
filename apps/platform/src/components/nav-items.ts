import { type LucideIcon, Thermometer } from 'lucide-react';

export interface NavItem {
  label: string;
  to: '/';
  icon: LucideIcon;
  // Licensed module the item belongs to; items without one are always shown.
  module?: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Psychrometrics', to: '/', icon: Thermometer }
];
