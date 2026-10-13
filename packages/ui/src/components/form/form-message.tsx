/** biome-ignore-all lint/suspicious/noExplicitAny: The error is because t() from react-i18next has strict
 *  typing for translation keys, and we're building the key dynamically with template literals like `validation.${code}`.
 *  TypeScript can't verify that this key exists in your translation files.
 * */

import { cn } from '@workspace/ui/lib/utils';
import { isEmpty, map } from 'es-toolkit/compat';
import type { ComponentProps } from 'react';
// import { useTranslation } from 'react-i18next';
import { useFormField } from './use-form-field';

export const FormMessage = ({ className, children, ...props }: ComponentProps<'div'>) => {
  const { error: clientError, fieldServerErrors, formMessageId /* label */ } = useFormField();

  // const { t } = useTranslation();

  return (
    <div
      id={formMessageId}
      className={cn(
        'text-[0.8rem] text-destructive min-h-6 flex flex-col items-end gap-2 pb-2',
        className
      )}
      {...props}
    >
      {!isEmpty(clientError) || !isEmpty(fieldServerErrors) ? (
        <>
          {clientError && (
            <p className='flex items-end gap-1'>
              {/* <CircleXIcon className='size-4' /> */}
              {String(clientError?.message)}
            </p>
          )}
          {map(fieldServerErrors, (error /* { code, meta } */, index) => (
            <p key={`${error.source?.pointer}-${index}`} className='flex items-end gap-1'>
              {/* <CircleXIcon className='size-4' /> */}
              {/* {t(`resource-components:validation.${code}` as any, {
                field: label,
                ...meta?.validation
              })} */}
            </p>
          ))}
        </>
      ) : (
        <p className='flex items-end gap-1'>{children}&nbsp;</p>
      )}
    </div>
  );
};
