import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent-ink)] px-4 py-2.5 text-[var(--paper)] shadow-[0_18px_40px_rgba(46,57,55,0.18)] hover:-translate-y-0.5 hover:bg-[var(--accent-ink-strong)]',
        secondary:
          'border border-[var(--line-strong)] bg-[var(--panel-soft)] px-4 py-2.5 text-[var(--ink)] hover:-translate-y-0.5 hover:bg-[var(--panel)]',
        ghost:
          'px-3 py-2 text-[var(--muted-ink)] hover:bg-[var(--panel-soft)] hover:text-[var(--ink)]',
        destructive:
          'bg-[var(--tone-drop)] px-4 py-2.5 text-white hover:-translate-y-0.5 hover:brightness-95',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-5',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
