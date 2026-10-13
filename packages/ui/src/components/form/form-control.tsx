import { useRender } from '@base-ui/react/use-render';
import type { ReactElement } from 'react';
import { useFormField } from './use-form-field';

export const FormControl = ({
  children,
  ...props
}: { children: ReactElement } & Record<string, unknown>) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return useRender({
    render: children,
    props: {
      id: formItemId,
      'aria-describedby': !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`,
      'aria-invalid': !!error,
      ...props
    }
  });
};
