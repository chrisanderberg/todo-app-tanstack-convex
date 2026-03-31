import { v } from 'convex/values'
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import {
  buildOrderedIds,
  insertAtPosition,
  moveItemToPosition,
  recomputeRankedTaskUpdates,
} from '../src/lib/ranking/task-ranking'

const resolutionValidator = v.union(
  v.literal('do'),
  v.literal('schedule'),
  v.literal('delegate'),
  v.literal('drop'),
  v.null(),
)

function toListItem(task: Doc<'tasks'>) {
  return {
    id: task._id,
    title: task.title,
    description: task.description,
    status: task.status,
    resolutionType: task.resolutionType,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    importanceRank: task.importanceRank,
    urgencyRank: task.urgencyRank,
    importancePercentile: task.importancePercentile,
    urgencyPercentile: task.urgencyPercentile,
  }
}

type ActiveTaskSnapshot = {
  _id: Id<'tasks'>
  importanceRank: number
  urgencyRank: number
  status: 'active'
}

async function getActiveTasksByImportance(ctx: QueryCtx | MutationCtx) {
  return await ctx.db
    .query('tasks')
    .withIndex('by_status_and_importanceRank', (queryBuilder) =>
      queryBuilder.eq('status', 'active'),
    )
    .collect()
}

async function getActiveTasksByUrgency(ctx: QueryCtx | MutationCtx) {
  return await ctx.db
    .query('tasks')
    .withIndex('by_status_and_urgencyRank', (queryBuilder) =>
      queryBuilder.eq('status', 'active'),
    )
    .collect()
}

async function applyActiveRankUpdates(
  ctx: MutationCtx,
  tasks: ActiveTaskSnapshot[],
  importanceOrderedIds: string[],
  urgencyOrderedIds: string[],
) {
  const updates = recomputeRankedTaskUpdates(
    tasks.map((task) => ({
      id: task._id,
      status: task.status,
      importanceRank: task.importanceRank,
      urgencyRank: task.urgencyRank,
    })),
    importanceOrderedIds,
    urgencyOrderedIds,
  )

  for (const task of tasks) {
    const next = updates.get(task._id)
    if (!next) {
      continue
    }

    await ctx.db.patch(task._id, next)
  }
}

export const matrixData = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await getActiveTasksByImportance(ctx)
    return tasks.map((task: Doc<'tasks'>) => ({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      resolutionType: task.resolutionType,
      dueDate: task.dueDate,
      x: task.importancePercentile,
      y: task.urgencyPercentile,
      importanceRank: task.importanceRank,
      urgencyRank: task.urgencyRank,
    }))
  },
})

export const listTasks = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query('tasks').collect()

    return tasks
      .sort((left, right) => {
        if (left.status !== right.status) {
          if (left.status === 'active') return -1
          if (right.status === 'active') return 1
        }

        return left.importanceRank - right.importanceRank
      })
      .map(toListItem)
  },
})

export const getTaskDetail = query({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId)
    return task ? toListItem(task) : null
  },
})

export const rankingOptions = query({
  args: {
    taskId: v.optional(v.id('tasks')),
  },
  handler: async (ctx, args) => {
    const importance = await getActiveTasksByImportance(ctx)
    const urgency = await getActiveTasksByUrgency(ctx)

    return {
      importance: importance.map((task: Doc<'tasks'>) => ({
        id: task._id,
        title: task.title,
      })),
      urgency: urgency.map((task: Doc<'tasks'>) => ({
        id: task._id,
        title: task.title,
      })),
      currentTaskId: args.taskId ?? null,
    }
  },
})

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    dueDate: v.union(v.string(), v.null()),
    resolutionType: resolutionValidator,
    importancePosition: v.number(),
    urgencyPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const activeByImportance = await getActiveTasksByImportance(ctx)
    const activeByUrgency = await getActiveTasksByUrgency(ctx)

    const taskId = await ctx.db.insert('tasks', {
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      resolutionType: args.resolutionType,
      status: 'active',
      importanceRank: activeByImportance.length,
      urgencyRank: activeByUrgency.length,
      importancePercentile: 0,
      urgencyPercentile: 0,
      createdAt: now,
      updatedAt: now,
    })

    const importanceIds = insertAtPosition(
      activeByImportance.map((task: Doc<'tasks'>) => task._id),
      taskId,
      args.importancePosition,
    )
    const urgencyIds = insertAtPosition(
      activeByUrgency.map((task: Doc<'tasks'>) => task._id),
      taskId,
      args.urgencyPosition,
    )

    await applyActiveRankUpdates(
      ctx,
      [
        ...activeByImportance.map((task: Doc<'tasks'>) => ({
          _id: task._id,
          importanceRank: task.importanceRank,
          urgencyRank: task.urgencyRank,
          status: 'active' as const,
        })),
        {
          _id: taskId,
          importanceRank: activeByImportance.length,
          urgencyRank: activeByUrgency.length,
          status: 'active' as const,
        },
      ],
      importanceIds,
      urgencyIds,
    )

    return taskId
  },
})

export const updateTask = mutation({
  args: {
    taskId: v.id('tasks'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.union(v.string(), v.null())),
    resolutionType: v.optional(resolutionValidator),
    importancePosition: v.optional(v.number()),
    urgencyPosition: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId)
    if (!task) {
      throw new Error('Task not found.')
    }

    await ctx.db.patch(args.taskId, {
      ...(args.title !== undefined ? { title: args.title } : null),
      ...(args.description !== undefined ? { description: args.description } : null),
      ...(args.dueDate !== undefined ? { dueDate: args.dueDate } : null),
      ...(args.resolutionType !== undefined
        ? { resolutionType: args.resolutionType }
        : null),
      updatedAt: Date.now(),
    })

    if (
      task.status !== 'active' ||
      (args.importancePosition === undefined && args.urgencyPosition === undefined)
    ) {
      return args.taskId
    }

    const activeByImportance = await getActiveTasksByImportance(ctx)
    const importanceIds = args.importancePosition === undefined
      ? buildOrderedIds(
          activeByImportance.map((activeTask: Doc<'tasks'>) => ({
            id: activeTask._id,
            status: activeTask.status,
            importanceRank: activeTask.importanceRank,
            urgencyRank: activeTask.urgencyRank,
          })),
          'importance',
        )
      : moveItemToPosition(
          activeByImportance.map((activeTask: Doc<'tasks'>) => activeTask._id),
          (taskId) => taskId === args.taskId,
          args.importancePosition,
        )

    const activeByUrgency = await getActiveTasksByUrgency(ctx)
    const urgencyIds = args.urgencyPosition === undefined
      ? buildOrderedIds(
          activeByUrgency.map((activeTask: Doc<'tasks'>) => ({
            id: activeTask._id,
            status: activeTask.status,
            importanceRank: activeTask.importanceRank,
            urgencyRank: activeTask.urgencyRank,
          })),
          'urgency',
        )
      : moveItemToPosition(
          activeByUrgency.map((activeTask: Doc<'tasks'>) => activeTask._id),
          (taskId) => taskId === args.taskId,
          args.urgencyPosition,
        )

    const activeUniverse = activeByImportance.map((activeTask: Doc<'tasks'>) => ({
      _id: activeTask._id,
      importanceRank: activeTask.importanceRank,
      urgencyRank: activeTask.urgencyRank,
      status: 'active' as const,
    }))

    await applyActiveRankUpdates(ctx, activeUniverse, importanceIds, urgencyIds)
    return args.taskId
  },
})

export const setTaskStatus = mutation({
  args: {
    taskId: v.id('tasks'),
    status: v.union(v.literal('completed'), v.literal('archived')),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId)
    if (!task) {
      throw new Error('Task not found.')
    }

    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now(),
    })

    if (task.status !== 'active') {
      return args.taskId
    }

    const remainingActive = await getActiveTasksByImportance(ctx)
    const filtered = remainingActive.filter(
      (activeTask: Doc<'tasks'>) => activeTask._id !== args.taskId,
    )
    const urgencyActive = (await getActiveTasksByUrgency(ctx)).filter(
      (activeTask: Doc<'tasks'>) => activeTask._id !== args.taskId,
    )

    await applyActiveRankUpdates(
      ctx,
      filtered.map((activeTask: Doc<'tasks'>) => ({
        _id: activeTask._id,
        importanceRank: activeTask.importanceRank,
        urgencyRank: activeTask.urgencyRank,
        status: 'active' as const,
      })),
      filtered.map((activeTask: Doc<'tasks'>) => activeTask._id),
      urgencyActive.map((activeTask: Doc<'tasks'>) => activeTask._id),
    )

    return args.taskId
  },
})

export const restoreTask = mutation({
  args: {
    taskId: v.id('tasks'),
    importancePosition: v.number(),
    urgencyPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId)
    if (!task) {
      throw new Error('Task not found.')
    }

    if (task.status === 'active') {
      return args.taskId
    }

    await ctx.db.patch(args.taskId, {
      status: 'active',
      updatedAt: Date.now(),
    })

    const activeByImportance = await getActiveTasksByImportance(ctx)
    const activeByUrgency = await getActiveTasksByUrgency(ctx)

    const importanceIds = insertAtPosition(
      activeByImportance
        .filter((activeTask: Doc<'tasks'>) => activeTask._id !== args.taskId)
        .map((activeTask: Doc<'tasks'>) => activeTask._id),
      args.taskId,
      args.importancePosition,
    )
    const urgencyIds = insertAtPosition(
      activeByUrgency
        .filter((activeTask: Doc<'tasks'>) => activeTask._id !== args.taskId)
        .map((activeTask: Doc<'tasks'>) => activeTask._id),
      args.taskId,
      args.urgencyPosition,
    )

    await applyActiveRankUpdates(
      ctx,
      activeByImportance.map((activeTask: Doc<'tasks'>) => ({
        _id: activeTask._id,
        importanceRank: activeTask.importanceRank,
        urgencyRank: activeTask.urgencyRank,
        status: 'active' as const,
      })),
      importanceIds,
      urgencyIds,
    )

    return args.taskId
  },
})
