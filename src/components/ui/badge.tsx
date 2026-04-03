import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-(--border-strong) bg-(--bg-surface) px-2 py-0.5 text-(--text-secondary) text-xs font-semibold tracking-[0.06em] uppercase',
        className,
      )}
      {...props}
    />
  )
}
