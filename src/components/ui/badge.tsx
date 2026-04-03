import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-0.5 text-xs font-semibold tracking-[0.06em] uppercase text-[var(--text-secondary)]',
        className,
      )}
      {...props}
    />
  )
}
