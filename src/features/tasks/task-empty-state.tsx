import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TaskEmptyState({
  errorMessage,
  isSeeding = false,
  onSeed,
  onCreate,
}: {
  errorMessage?: string | null
  isSeeding?: boolean
  onSeed: () => void | Promise<void>
  onCreate: () => void
}) {
  return (
    <div className="empty-state">
      {/* Decorative quadrant grid */}
      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
        <rect x="4" y="4" width="52" height="52" rx="8" fill="var(--tone-delegate-soft)" stroke="var(--tone-delegate)" strokeWidth="1" opacity="0.6" />
        <rect x="64" y="4" width="52" height="52" rx="8" fill="var(--tone-do-soft)" stroke="var(--tone-do)" strokeWidth="1" opacity="0.6" />
        <rect x="4" y="64" width="52" height="52" rx="8" fill="var(--tone-drop-soft)" stroke="var(--tone-drop)" strokeWidth="1" opacity="0.6" />
        <rect x="64" y="64" width="52" height="52" rx="8" fill="var(--tone-schedule-soft)" stroke="var(--tone-schedule)" strokeWidth="1" opacity="0.6" />
        <text x="30" y="34" textAnchor="middle" dominantBaseline="middle" fill="var(--tone-delegate)" fontSize="8" fontWeight="700" letterSpacing="0.14em">DEL</text>
        <text x="90" y="34" textAnchor="middle" dominantBaseline="middle" fill="var(--tone-do)" fontSize="8" fontWeight="700" letterSpacing="0.14em">DO</text>
        <text x="30" y="94" textAnchor="middle" dominantBaseline="middle" fill="var(--tone-drop)" fontSize="8" fontWeight="700" letterSpacing="0.14em">DROP</text>
        <text x="90" y="94" textAnchor="middle" dominantBaseline="middle" fill="var(--tone-schedule)" fontSize="8" fontWeight="700" letterSpacing="0.14em">SCH</text>
      </svg>

      <div>
        <h2 className="text-xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">
          No tasks yet
        </h2>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)] max-w-xs">
          Start with one real task or load sample data to see the matrix and ranking in action.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs text-[var(--text-tertiary)] max-w-sm">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-2.5 text-center leading-4">
          Rank by importance & urgency independently
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-2.5 text-center leading-4">
          Drag points in the matrix to reorder both at once
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-2.5 text-center leading-4">
          Open any task to edit details and set resolutions
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-[var(--tone-drop)] bg-[var(--tone-drop-soft)] px-4 py-2.5 text-sm text-[var(--tone-drop)] max-w-xs text-center">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={onCreate}>Create first task</Button>
        <Button disabled={isSeeding} variant="secondary" onClick={() => void onSeed()}>
          <Sparkles className="h-3.5 w-3.5" />
          {isSeeding ? 'Loading…' : 'Load sample data'}
        </Button>
      </div>
    </div>
  )
}
