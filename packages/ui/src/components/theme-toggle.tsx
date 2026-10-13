import { Button } from '@workspace/ui/components/button';
import { useTheme } from '@workspace/ui/components/theme-provider';
import { Monitor, Moon, Sun } from 'lucide-react';

const THEME_ORDER = ['light', 'dark', 'system'] as const;

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = THEME_ICONS[theme];

  const handleClick = () => {
    const nextIndex = (THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length;
    setTheme(THEME_ORDER[nextIndex]);
  };

  return (
    <Button
      variant='outline'
      size='icon'
      data-slot='theme-toggle'
      aria-label={`Theme: ${theme}. Click to change.`}
      onClick={handleClick}
    >
      <Icon />
    </Button>
  );
}

export { ThemeToggle };
