import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <Card className="overflow-hidden">
      <CardHeader className="relative pb-2">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(187,85,53,0.22),transparent_62%),radial-gradient(circle_at_top_right,rgba(112,134,119,0.2),transparent_58%)]" />
        <div className="relative">
          <p className="eyebrow">Blank matrix</p>
          <CardTitle>No ranked tasks yet</CardTitle>
          <CardDescription>
            Start with one real task or load sample data to see the matrix,
            ordered lists, detail editing, and ranking interactions working together.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 text-sm text-[var(--muted-ink)] md:grid-cols-3">
          <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3">
            Rank tasks by importance and urgency independently.
          </div>
          <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3">
            Drag points in the matrix to reshape both dimensions at once.
          </div>
          <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3">
            Open any task to edit details, due dates, and resolution plans.
          </div>
        </div>
        {errorMessage ? (
          <p className="rounded-[1rem] border border-[rgba(181,86,57,0.16)] bg-[rgba(181,86,57,0.08)] px-4 py-3 text-sm text-[var(--tone-drop)]">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
        <Button onClick={onCreate}>Create first task</Button>
        <Button disabled={isSeeding} variant="secondary" onClick={() => void onSeed()}>
          <Sparkles className="h-4 w-4" />
          {isSeeding ? 'Loading sample tasks...' : 'Load sample tasks'}
        </Button>
        </div>
      </CardContent>
    </Card>
  )
}
