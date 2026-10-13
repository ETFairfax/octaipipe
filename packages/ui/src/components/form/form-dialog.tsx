import type { ComponentProps, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog';
import { ScrollArea } from '../scroll-area';
import { useFormCancellationContext } from './form-cancellation-provider';

// Closing always goes through the form's cancellation guard, so the dialog is controlled by the
// caller and `onOpenChange` is not accepted.
type Props = Omit<ComponentProps<typeof Dialog>, 'children' | 'open' | 'onOpenChange'> & {
  open: boolean;
  title: ReactNode;
  children?: ReactNode;
};

export const FormDialog = ({ title, children, ...rest }: Props) => {
  const { invokeCancel } = useFormCancellationContext();

  return (
    <Dialog
      {...rest}
      onOpenChange={open => {
        if (!open) invokeCancel();
      }}
    >
      <DialogContent
        // tabIndex={-1}
        // autoFocus={false}
        // onOpenAutoFocus={e => {
        //   e.preventDefault();
        // }}
        className='max-h-[calc(100dvh-0.75rem)] w-[calc(100dvw-0.75rem)] p-0'
      >
        <ScrollArea className='max-h-[calc(100dvh-1rem)]'>
          <div className='p-6'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 mb-4'>{title}</DialogTitle>
            </DialogHeader>
            {children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
