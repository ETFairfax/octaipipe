import { Button } from '@workspace/ui/components/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@workspace/ui/components/drawer';
import { Switch } from '@workspace/ui/components/switch';
import { useCookieConsent } from '@workspace/ui/hooks/use-cookie-consent';

function CookieBanner() {
  const { isOpen, otherCookies, choices, setChoice, accept } = useCookieConsent();

  return (
    <Drawer open={isOpen} onOpenChange={() => {}} disablePointerDismissal swipeDirection='right'>
      <DrawerContent data-slot='cookie-banner'>
        <DrawerHeader>
          <DrawerTitle>Cookie preferences</DrawerTitle>
          <DrawerDescription>
            We use cookies to run this site and, with your permission, to understand how it's used.
          </DrawerDescription>
        </DrawerHeader>
        <div className='flex flex-col gap-4 overflow-y-auto p-4'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-foreground'>Necessary Cookies</p>
              <p className='text-sm text-muted-foreground'>
                Required for the site to function. Always on.
              </p>
            </div>
            <Switch checked disabled aria-label='Necessary Cookies (always on)' />
          </div>
          {otherCookies.map(cookie => (
            <div key={cookie.id} className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-sm font-medium text-foreground'>{cookie.name}</p>
                <p className='text-sm text-muted-foreground'>{cookie.description}</p>
              </div>
              <Switch
                checked={choices[cookie.id] ?? true}
                onCheckedChange={checked => setChoice(cookie.id, checked)}
                aria-label={cookie.name}
              />
            </div>
          ))}
        </div>
        <DrawerFooter>
          <Button data-slot='cookie-banner-accept' onClick={accept}>
            Accept
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export { CookieBanner };
