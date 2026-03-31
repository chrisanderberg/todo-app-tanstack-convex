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
        'flex min-h-[120px] w-full rounded-[1.4rem] border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition placeholder:text-[var(--muted-ink)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        className,
      )}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
