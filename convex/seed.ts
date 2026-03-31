import { mutation } from './_generated/server'
import { recomputeRankedTaskUpdates } from '../src/lib/ranking/task-ranking'

const sampleTasks = [
  {
    title: 'Prepare investor update',
    description: 'Summarize wins, risks, and next-quarter focus.',
    resolutionType: 'do' as const,
    dueDate: null,
  },
  {
    title: 'Book annual health visit',
    description: 'Choose a date before the calendar fills up.',
    resolutionType: 'schedule' as const,
    dueDate: '2026-04-15',
  },
  {
    title: 'Delegate deck polish',
    description: 'Ask for visual cleanup before the Monday review.',
    resolutionType: 'delegate' as const,
    dueDate: null,
  },
  {
    title: 'Cull stale reading list',
    description: 'Archive links that have sat untouched for months.',
    resolutionType: 'drop' as const,
    dueDate: null,
  },
  {
    title: 'Refine hiring scorecard',
    description: 'Tighten interview criteria before the next round.',
    resolutionType: 'do' as const,
    dueDate: '2026-04-03',
  },
  {
    title: 'Plan birthday dinner',
    description: 'Lock a table and send the invite.',
    resolutionType: 'schedule' as const,
    dueDate: '2026-04-10',
  },
]

export const seedSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('tasks').collect()
    if (existing.length > 0) {
      return { inserted: 0, skipped: true }
    }

    const now = Date.now()
    const ids = []
    for (let index = 0; index < sampleTasks.length; index += 1) {
      const task = sampleTasks[index]
      const id = await ctx.db.insert('tasks', {
        ...task,
        status: 'active',
        importanceRank: index,
        urgencyRank: sampleTasks.length - index - 1,
        importancePercentile: 0,
        urgencyPercentile: 0,
        createdAt: now + index,
        updatedAt: now + index,
      })
      ids.push(id)
    }

    const updates = recomputeRankedTaskUpdates(
      ids.map((id, index) => ({
        id,
        status: 'active' as const,
        importanceRank: index,
        urgencyRank: sampleTasks.length - index - 1,
      })),
      ids,
      [...ids].reverse(),
    )

    for (const id of ids) {
      const next = updates.get(id)
      if (!next) {
        continue
      }
      await ctx.db.patch(id, next)
    }

    return { inserted: ids.length, skipped: false }
  },
})
