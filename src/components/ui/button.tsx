import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent)] px-4 py-2.5 text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02]',
        secondary:
          'border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)]',
        ghost:
          'px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
        destructive:
          'bg-[var(--tone-drop)] px-4 py-2.5 text-white hover:brightness-110 hover:scale-[1.02]',
      },
      size: {
        default: 'h-9',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-5',
        icon: 'h-8 w-8 rounded-md',
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
