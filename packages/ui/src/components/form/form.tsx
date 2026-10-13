import { cn } from '@workspace/ui/lib/utils';
import type { ComponentProps } from 'react';

export const Form = ({ className, ...props }: ComponentProps<'form'>) => (
  <form className={cn('', className)} {...props} />
);
