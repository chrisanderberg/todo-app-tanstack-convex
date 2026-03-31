import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    importanceRank: v.number(),
    urgencyRank: v.number(),
    importancePercentile: v.number(),
    urgencyPercentile: v.number(),
    resolutionType: v.union(
      v.literal('do'),
      v.literal('schedule'),
      v.literal('delegate'),
      v.literal('drop'),
      v.null(),
    ),
    status: v.union(
      v.literal('active'),
      v.literal('completed'),
      v.literal('archived'),
    ),
    dueDate: v.union(v.string(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_status_and_importanceRank', ['status', 'importanceRank'])
    .index('by_status_and_urgencyRank', ['status', 'urgencyRank'])
    .index('by_status_and_updatedAt', ['status', 'updatedAt']),
})
