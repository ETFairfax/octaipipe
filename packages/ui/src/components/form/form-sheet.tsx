import type { ComponentProps, ReactNode } from 'react';
import { ScrollArea } from '../scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../sheet';
import { useFormCancellationContext } from './form-cancellation-provider';

// Closing always goes through the form's cancellation guard, so the sheet is controlled by the
// caller and `onOpenChange` is not accepted.
type Props = Omit<ComponentProps<typeof Sheet>, 'children' | 'open' | 'onOpenChange'> & {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
};

export const FormSheet = ({ title, description, children, ...rest }: Props) => {
  const { invokeCancel } = useFormCancellationContext();

  return (
    <Sheet
      {...rest}
      onOpenChange={open => {
        if (!open) invokeCancel();
      }}
    >
      <SheetContent
        side='right'
        tabIndex={undefined} // Without this, when an invalid input (one showing a validation error) looses focus, the sheet becomes selected rather than the next input.
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className='p-4' autoFocus>
          {children}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
