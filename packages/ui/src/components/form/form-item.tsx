import type { ComponentProps } from 'react';
import { useId } from 'react';
import { FormItemContext } from './form-item-context';

export const FormItem = ({ className, ...props }: ComponentProps<'div'>) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={className} {...props} />
    </FormItemContext.Provider>
  );
};
