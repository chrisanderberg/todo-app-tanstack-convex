import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[100px] w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm leading-6 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        className,
      )}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
