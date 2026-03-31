import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[var(--line-strong)] bg-[var(--panel-soft)] px-3 py-1 text-xs font-semibold tracking-[0.08em] uppercase text-[var(--muted-ink)]',
        className,
      )}
      {...props}
    />
  )
}
