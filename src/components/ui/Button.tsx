import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white shadow-[0_6px_18px_-6px_rgb(148_3_166/0.7)] hover:bg-brand-strong dark:text-brand-deep dark:hover:text-brand-deep',
        secondary: 'bg-surface text-ink shadow-card ring-1 ring-line hover:bg-surface-2',
        soft: 'bg-brand-soft text-brand hover:bg-brand-soft/70',
        ghost: 'text-ink-soft hover:bg-surface-2 hover:text-ink',
        danger: 'bg-late-soft text-late hover:bg-late hover:text-white',
        white: 'bg-white text-brand-deep shadow-[0_10px_30px_-10px_rgb(40_4_48/0.5)] hover:bg-brand-soft',
      },
      size: {
        sm: 'h-9 px-4 text-sm [&_svg]:size-4',
        md: 'h-11 px-5 text-[0.95rem] [&_svg]:size-5',
        lg: 'h-14 px-7 text-base [&_svg]:size-5',
        icon: 'size-11 [&_svg]:size-5',
        'icon-sm': 'size-9 [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }

export const Button = ({ className, variant, size, asChild = false, type = 'button', ...props }: ButtonProps) => {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp type={asChild ? undefined : type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
