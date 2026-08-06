import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const button = cva(
  [
    'inline-flex items-center justify-center gap-2 text-center cursor-pointer',
    'font-sans font-medium leading-none whitespace-nowrap',
    'rounded-md transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-action text-white hover:bg-action-hover',
        secondary: 'bg-action-soft text-action-ink hover:bg-action hover:text-white',
        /**
         * У ghost-кнопки граница — единственный визуальный признак того, что
         * это орган управления, поэтому берём отдельный токен на 3:1
         * (WCAG 1.4.11), а не декоративный --color-border с его 1.34:1.
         */
        ghost:
          'bg-transparent text-text-primary border border-border-interactive hover:border-border-strong hover:bg-surface-sunk',
        /** То же, но поверх тёмных секций. */
        'ghost-inverse':
          'bg-transparent text-text-inverse border border-border-inverse-interactive hover:bg-inverse-hover focus-visible:outline-focus-inverse',
        inverse: 'bg-white text-surface-inverse hover:bg-surface-sunk',
      },
      size: {
        md: 'h-12 px-6 text-[15px]',
        lg: 'h-14 px-8 text-base',
        icon: 'size-11 px-0',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof button> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(button({ variant, size, block }), className)} {...props} />;
}

export { button as buttonVariants };
