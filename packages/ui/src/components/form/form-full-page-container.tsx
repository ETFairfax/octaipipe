import type { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
};

export const FormFullPageContainer = ({ children }: Props) => (
  <div className='w-full @lg:max-w-2xl mx-auto'>{children}</div>
);
