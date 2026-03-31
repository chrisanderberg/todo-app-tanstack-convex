import { describe, expect, it } from 'vitest'
import {
  buildOrderedIds,
  createPositionOptions,
  insertAtPosition,
  moveItemToPosition,
  percentileFromRank,
  positionFromPercentile,
  recomputeRankedTaskUpdates,
} from '@/lib/ranking/task-ranking'
import type { RankableTask } from '@/lib/task-model'

const tasks: RankableTask[] = [
  { id: 'a', status: 'active', importanceRank: 0, urgencyRank: 1 },
  { id: 'b', status: 'active', importanceRank: 1, urgencyRank: 0 },
  { id: 'c', status: 'active', importanceRank: 2, urgencyRank: 2 },
]

describe('insertAtPosition', () => {
  it('inserts into an empty list', () => {
    expect(insertAtPosition([], 'a', 0)).toEqual(['a'])
  })

  it('inserts at start, middle, and end', () => {
    expect(insertAtPosition(['b', 'c'], 'a', 0)).toEqual(['a', 'b', 'c'])
    expect(insertAtPosition(['a', 'c'], 'b', 1)).toEqual(['a', 'b', 'c'])
    expect(insertAtPosition(['a', 'b'], 'c', 99)).toEqual(['a', 'b', 'c'])
  })
})

describe('moveItemToPosition', () => {
  it('moves upward and downward', () => {
    expect(moveItemToPosition(['a', 'b', 'c'], (item) => item === 'c', 0)).toEqual([
      'c',
      'a',
      'b',
    ])
    expect(moveItemToPosition(['a', 'b', 'c'], (item) => item === 'a', 2)).toEqual([
      'b',
      'c',
      'a',
    ])
  })
})

describe('percentileFromRank', () => {
  it('returns zero for a single task', () => {
    expect(percentileFromRank(0, 1)).toBe(0)
  })

  it('returns edges for two tasks', () => {
    expect(percentileFromRank(0, 2)).toBe(0)
    expect(percentileFromRank(1, 2)).toBe(1)
  })

  it('returns fractional positions for larger sets', () => {
    expect(percentileFromRank(1, 4)).toBeCloseTo(1 / 3)
    expect(percentileFromRank(2, 4)).toBeCloseTo(2 / 3)
  })
})

describe('positionFromPercentile', () => {
  it('maps edge and near-edge percentiles to reachable rank slots', () => {
    expect(positionFromPercentile(0, 3)).toBe(0)
    expect(positionFromPercentile(0.2, 3)).toBe(0)
    expect(positionFromPercentile(0.3, 3)).toBe(1)
    expect(positionFromPercentile(0.8, 3)).toBe(2)
    expect(positionFromPercentile(1, 3)).toBe(2)
  })

  it('clamps out-of-range values safely', () => {
    expect(positionFromPercentile(-1, 4)).toBe(0)
    expect(positionFromPercentile(2, 4)).toBe(3)
  })
})

describe('recomputeRankedTaskUpdates', () => {
  it('recomputes contiguous ranks without mutating the other dimension order', () => {
    const importanceIds = ['b', 'a', 'c']
    const urgencyIds = buildOrderedIds(tasks, 'urgency')
    const updates = recomputeRankedTaskUpdates(tasks, importanceIds, urgencyIds)

    expect(updates.get('b')).toMatchObject({
      importanceRank: 0,
      urgencyRank: 0,
      urgencyPercentile: 0,
    })
    expect(updates.get('a')).toMatchObject({
      importanceRank: 1,
      urgencyRank: 1,
      urgencyPercentile: 0.5,
    })
    expect(updates.get('c')).toMatchObject({
      importanceRank: 2,
      urgencyRank: 2,
      importancePercentile: 1,
      urgencyPercentile: 1,
    })
  })
})

describe('createPositionOptions', () => {
  it('creates contextual before and after options', () => {
    expect(
      createPositionOptions([
        { id: 'a', title: 'Alpha' },
        { id: 'b', title: 'Beta' },
      ]),
    ).toEqual([
      { value: 0, label: '1. Before Alpha' },
      { value: 1, label: '2. Before Beta' },
      { value: 2, label: '3. After Beta' },
    ])
  })

  it('excludes the current task and renumbers the remaining positions', () => {
    expect(
      createPositionOptions(
        [
          { id: 'a', title: 'Alpha' },
          { id: 'b', title: 'Beta' },
        ],
        'a',
      ),
    ).toEqual([
      { value: 0, label: '1. Before Beta' },
      { value: 1, label: '2. After Beta' },
    ])
  })
})
