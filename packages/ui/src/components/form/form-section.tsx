import { cn } from '@workspace/ui/lib/utils';
import type { ComponentProps } from 'react';

const FormSection = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('px-4 border-b py-2', className)} {...props} />
);

const FormSectionHeading = ({ children, className, ...props }: ComponentProps<'h1'>) => (
  <h1 className={cn('mb-2 py-2 font-bold leading-normal tracking-tight', className)} {...props}>
    {children}
  </h1>
);

export { FormSection, FormSectionHeading };
