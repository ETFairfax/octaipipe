import { mergeProps, useRender } from '@base-ui/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const flexVariants = cva('flex flex-1 self-stretch', {
  variants: {
    align: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch'
    },
    direction: {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse'
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8'
    },
    justify: {
      normal: 'justify-normal',
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
      stretch: 'justify-stretch'
    }
  },
  defaultVariants: {
    align: 'center',
    direction: 'row',
    gap: 2,
    justify: 'start'
  }
});

function Flex({
  className,
  align,
  direction,
  gap,
  justify,
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof flexVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(flexVariants({ align, direction, gap, justify }), className)
      },
      props
    ),
    render,
    state: {
      slot: 'flex',
      align,
      direction,
      gap,
      justify
    }
  });
}

Flex.displayName = 'Flex';

export { Flex, flexVariants };
