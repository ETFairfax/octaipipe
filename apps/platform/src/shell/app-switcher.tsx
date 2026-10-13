import { Link } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@workspace/ui/components';
import { ChevronsUpDown } from 'lucide-react';

export function AppSwitcher() {
  const { isMobile } = useSidebar();
  const apps: Array<{ to: string; label: string }> = [
    { to: '/', label: 'ACE' },
    { to: '/', label: 'AISHA' }
  ];

  return (
    <SidebarMenu data-slot='app-switcher'>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTriggerButton label={'Foo'} />
          <DropdownMenuContent
            className='min-w-56'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            {/* DropdownMenuLabel is Base UI's Menu.GroupLabel and throws outside a group. */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Apps</DropdownMenuLabel>
              {apps.map(app => (
                <DropdownMenuItem key={app.to} render={<Link to={app.to} />}>
                  <span className='flex-1 truncate'>{app.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Split out only so the `render`-composed trigger markup reads in one piece; DropdownMenuTrigger
// renders *as* the SidebarMenuButton (Base UI's `render` prop, this repo's equivalent of Radix's
// `asChild`) so the button keeps its sidebar styling and collapse behavior.
function DropdownMenuTriggerButton({ label }: { label: string }) {
  return (
    <DropdownMenuTrigger
      render={
        <SidebarMenuButton
          size='lg'
          tooltip={label}
          className='data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground'
        />
      }
    >
      <div className='grid flex-1 text-left text-sm leading-tight'>
        <svg
          className='h-6! w-45.5! shrink-0 [&_path]:fill-current'
          width='182'
          height='24'
          viewBox='0 0 182 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <title>Octaipipe</title>
          <path
            d='M181.957 22.0774H169.207V2.05295H181.675V4.62752H172.021V10.4918H180.211V13.0664H172.021V19.5028H181.957V22.0774Z'
            fill='black'
          ></path>
          <path
            d='M155.172 22.0774H152.358V2.05295H159.338C162.941 2.05295 165.502 4.22703 165.502 8.1461C165.502 12.0652 162.856 14.2107 159.31 14.2107H155.172V22.0774ZM155.172 4.62752V11.6361H158.916C161.308 11.6361 162.687 10.406 162.687 8.1461C162.687 5.8862 161.365 4.62752 158.916 4.62752H155.172Z'
            fill='black'
          ></path>
          <path
            d='M147.078 2.05295V4.42728H143.025V19.7031H147.078V22.0774H136.157V19.7031H140.21V4.42728H136.157V2.05295H147.078Z'
            fill='black'
          ></path>
          <path
            d='M122.429 22.0774H119.615V2.05295H126.595C130.198 2.05295 132.759 4.22703 132.759 8.1461C132.759 12.0652 130.113 14.2107 126.567 14.2107H122.429V22.0774ZM122.429 4.62752V11.6361H126.173C128.565 11.6361 129.944 10.406 129.944 8.1461C129.944 5.8862 128.621 4.62752 126.173 4.62752H122.429Z'
            fill='black'
          ></path>
          <path
            d='M114.335 2.05295V4.42728H110.282V19.7031H114.335V22.0774H103.414V19.7031H107.467V4.42728H103.414V2.05295H114.335Z'
            fill='black'
          ></path>
          <path
            d='M99.8784 22.0774H96.9794L95.4596 16.9283H88.4794L86.9596 22.0774H84.145L90.2808 2.05295H93.8271L99.8784 22.0774ZM91.9695 5.02801L89.2394 14.3537H94.7278L91.9695 5.02801Z'
            fill='black'
          ></path>
          <path
            d='M76.5288 22.0774H73.7143V4.62752H68.1133V2.05295H82.1298V4.62752H76.5288V22.0774Z'
            fill='black'
          ></path>
          <path
            d='M58.7798 22.3635C53.7136 22.3635 51.0679 18.33 51.0679 12.0652C51.0679 5.9148 53.6854 1.76688 58.7798 1.76688C63.0016 1.76688 65.1407 4.62751 65.3377 8.40355H62.5231C62.3824 6.08644 61.144 4.34145 58.8642 4.34145H58.6953C55.5712 4.34145 53.8824 7.34512 53.8824 12.0652C53.8824 16.8424 55.543 19.7889 58.6953 19.7889H58.8642C61.2003 19.7889 62.3261 18.1297 62.5231 15.7268H65.3377C65.1407 19.5314 63.1142 22.3635 58.7798 22.3635Z'
            fill='black'
          ></path>
          <path
            d='M41.3685 22.3635C36.6963 22.3635 34.1069 18.4158 34.1069 12.0652C34.1069 5.71455 36.6963 1.76688 41.3685 1.76688C46.0407 1.76688 48.6301 5.71455 48.6301 12.0652C48.6301 18.4158 46.0407 22.3635 41.3685 22.3635ZM41.3122 19.7889H41.4248C44.3238 19.7889 45.8155 16.871 45.8155 12.0652C45.8155 7.2593 44.3238 4.34145 41.4248 4.34145H41.3122C38.4132 4.34145 36.9215 7.2593 36.9215 12.0652C36.9215 16.871 38.4132 19.7889 41.3122 19.7889Z'
            fill='black'
          ></path>
          <g clip-path='url(#clip0_9769_921)'>
            <path
              d='M6.44904 18.4696C2.89198 18.4696 0 15.5113 0 11.8727H2.57447C2.57447 14.0585 4.31223 15.8361 6.44904 15.8361C8.58585 15.8361 10.3236 14.0585 10.3236 11.8727H12.8981C12.8981 15.5113 10.0061 18.4696 6.44904 18.4696Z'
              fill='black'
            ></path>
            <path
              d='M6.44922 23.741V21.1075C11.4265 21.1075 15.477 16.9642 15.477 11.8727H18.0515C18.0515 18.417 12.8468 23.741 6.44922 23.741Z'
              fill='black'
            ></path>
            <path
              d='M16.7682 9.23482C17.4791 9.23482 18.0554 8.64529 18.0554 7.91807C18.0554 7.19085 17.4791 6.60132 16.7682 6.60132C16.0573 6.60132 15.481 7.19085 15.481 7.91807C15.481 8.64529 16.0573 9.23482 16.7682 9.23482Z'
              fill='black'
            ></path>
            <path
              d='M18.3087 24L16.4894 22.139C19.1711 19.3958 20.6471 15.7484 20.6471 11.8683V9.23482C20.6471 5.5962 17.7509 2.6335 14.1938 2.6335C10.6368 2.6335 7.74049 5.5962 7.74049 9.23482V11.8683H5.16602V9.23482C5.16173 4.14338 9.21222 0 14.1938 0C19.1754 0 23.2216 4.14338 23.2216 9.23482V11.8683C23.2216 16.4506 21.4753 20.7608 18.3087 24Z'
              fill='black'
            ></path>
          </g>
          <defs>
            <clipPath id='clip0_9769_921'>
              <rect width='23.2217' height='24' fill='white'></rect>
            </clipPath>
          </defs>
        </svg>
        {/* <span className='truncate font-medium'>{label}</span>
        <span className='truncate text-xs opacity-70'>Switch app</span> */}
      </div>
      <ChevronsUpDown className='ml-auto' />
    </DropdownMenuTrigger>
  );
}
