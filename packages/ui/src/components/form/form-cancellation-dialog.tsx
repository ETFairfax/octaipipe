import { Button } from '../button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../dialog';

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/* Shown when a user cancels or navigates away from a dirty in form */
export const FormCancellationDialog = ({ open, onConfirm, onCancel }: Props) => (
  <Dialog
    open={open}
    onOpenChange={next => {
      if (!next) onCancel();
    }}
  >
    <DialogContent className='w-fit'>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>Are you sure?</DialogTitle>
        <DialogDescription>You have unsaved changes, leave the form?</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant='secondary' onClick={onCancel}>
          Cancel
        </Button>
        <Button variant='destructive' onClick={onConfirm}>
          Yes, discard changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
