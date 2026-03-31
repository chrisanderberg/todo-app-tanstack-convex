import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'
import type { Id } from '../../../convex/_generated/dataModel'
import type { MatrixPoint } from '@/lib/task-model'
import { cn } from '@/lib/utils'
import {
  percentileFromRank,
  positionFromPercentile,
} from '@/lib/ranking/task-ranking'
import { formatShortDueDate } from '@/features/tasks/use-task-data'
import { resolutionLabels } from '@/lib/task-model'

type MatrixChartProps = {
  currentTaskId?: Id<'tasks'>
  onPointClick?: (taskId: Id<'tasks'>) => void
  onPointReorder?: (
    taskId: Id<'tasks'>,
    next: { importancePosition: number; urgencyPosition: number },
  ) => void | Promise<void>
  points: MatrixPoint[]
  subtitle?: string
}

type PointDatum = MatrixPoint & {
  x: number
  y: number
}

type HoverState = {
  point: PointDatum
  x: number
  y: number
}

type DragState = {
  point: PointDatum
  pointerId: number
  startedAt: { x: number; y: number }
  currentAt: { x: number; y: number }
}

type InteractiveNode = {
  x: number
  y: number
  size: number
  data: PointDatum
  serieId: string | number
}

const CHART_MARGIN = { top: 24, right: 34, bottom: 60, left: 64 }
const DRAG_THRESHOLD = 8

const regionLabels = [
  { x: 0.17, y: 0.18, label: 'Delegate', tone: 'var(--tone-delegate)' },
  { x: 0.74, y: 0.18, label: 'Drop', tone: 'var(--tone-drop)' },
  { x: 0.16, y: 0.84, label: 'Do', tone: 'var(--tone-do)' },
  { x: 0.74, y: 0.84, label: 'Schedule', tone: 'var(--tone-schedule)' },
]

function getNormalizedPlotPosition(
  frame: DOMRect,
  pointer: { x: number; y: number },
) {
  const innerWidth = frame.width - CHART_MARGIN.left - CHART_MARGIN.right
  const innerHeight = frame.height - CHART_MARGIN.top - CHART_MARGIN.bottom

  const normalizedX = Math.max(
    0,
    Math.min(1, (pointer.x - frame.left - CHART_MARGIN.left) / innerWidth),
  )
  const normalizedYFromTop = Math.max(
    0,
    Math.min(1, (pointer.y - frame.top - CHART_MARGIN.top) / innerHeight),
  )

  return {
    x: normalizedX,
    y: 1 - normalizedYFromTop,
  }
}

function getProjectedReorder(
  points: PointDatum[],
  draggedPoint: PointDatum,
  nextPlotPosition: { x: number; y: number },
) {
  const remaining = points.filter((point) => point.id !== draggedPoint.id)
  const totalPoints = points.length
  const importancePosition = positionFromPercentile(
    nextPlotPosition.x,
    totalPoints,
  )
  const urgencyPosition = positionFromPercentile(
    nextPlotPosition.y,
    totalPoints,
  )

  const importanceOrdered = [...remaining]
    .sort((left, right) => left.importanceRank - right.importanceRank)
  importanceOrdered.splice(importancePosition, 0, draggedPoint)

  const urgencyOrdered = [...remaining]
    .sort((left, right) => left.urgencyRank - right.urgencyRank)
  urgencyOrdered.splice(urgencyPosition, 0, draggedPoint)

  const importanceRanks = new Map(
    importanceOrdered.map((point, index) => [point.id, index]),
  )
  const urgencyRanks = new Map(
    urgencyOrdered.map((point, index) => [point.id, index]),
  )
  const projectedPoints = points.map((point) => {
    const nextImportanceRank = importanceRanks.get(point.id) ?? point.importanceRank
    const nextUrgencyRank = urgencyRanks.get(point.id) ?? point.urgencyRank

    return {
      ...point,
      importanceRank: nextImportanceRank,
      urgencyRank: nextUrgencyRank,
      x: percentileFromRank(nextImportanceRank, totalPoints),
      y: percentileFromRank(nextUrgencyRank, totalPoints),
    }
  })

  return {
    importancePosition,
    projectedPoints,
    urgencyPosition,
  }
}

function MatrixRegionsLayer({
  innerHeight,
  innerWidth,
}: {
  innerHeight: number
  innerWidth: number
}) {
  const halfWidth = innerWidth / 2
  const halfHeight = innerHeight / 2

  return (
    <g opacity={0.28}>
      <rect width={halfWidth} height={halfHeight} fill="rgba(116, 142, 148, 0.18)" />
      <rect
        x={halfWidth}
        width={halfWidth}
        height={halfHeight}
        fill="rgba(181, 114, 74, 0.12)"
      />
      <rect
        y={halfHeight}
        width={halfWidth}
        height={halfHeight}
        fill="rgba(74, 132, 94, 0.16)"
      />
      <rect
        x={halfWidth}
        y={halfHeight}
        width={halfWidth}
        height={halfHeight}
        fill="rgba(152, 146, 96, 0.12)"
      />
      {regionLabels.map((region) => (
        <text
          key={region.label}
          x={innerWidth * region.x}
          y={innerHeight * region.y}
          fill={region.tone}
          fontSize={12}
          fontWeight={700}
          letterSpacing="0.18em"
          textAnchor="middle"
        >
          {region.label}
        </text>
      ))}
    </g>
  )
}

export function TaskMatrixChart({
  currentTaskId,
  onPointClick,
  onPointReorder,
  points,
  subtitle,
}: MatrixChartProps) {
  const [mounted, setMounted] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<HoverState | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)
  const plotFrameRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isInteractive = Boolean(onPointClick || onPointReorder)

  const projectedDrag = useMemo(() => {
    if (!dragState || !plotFrameRef.current) {
      return null
    }

    const frame = plotFrameRef.current.getBoundingClientRect()
    const nextPlotPosition = getNormalizedPlotPosition(frame, dragState.currentAt)
    return getProjectedReorder(points, dragState.point, nextPlotPosition)
  }, [dragState, points])

  const renderedPoints = projectedDrag?.projectedPoints ?? points

  const data = useMemo(
    () => {
      const current = currentTaskId
        ? renderedPoints.filter((point) => point.id === currentTaskId)
        : []
      const others = currentTaskId
        ? renderedPoints.filter((point) => point.id !== currentTaskId)
        : renderedPoints

      return [
        {
          id: 'tasks',
          data: others.map((point) => ({ ...point, x: point.x, y: point.y })),
        },
        ...(current.length > 0
          ? [
              {
                id: 'current',
                data: current.map((point) => ({
                  ...point,
                  x: point.x,
                  y: point.y,
                })),
              },
            ]
          : []),
      ]
    },
    [currentTaskId, renderedPoints],
  )

  useEffect(() => {
    if (!dragState || !onPointReorder) {
      return
    }

    const activeDrag = dragState
    const commitReorder = onPointReorder

    async function handlePointerUp(event: PointerEvent) {
      if (event.pointerId !== activeDrag.pointerId) {
        return
      }

      const frame = plotFrameRef.current?.getBoundingClientRect()
      if (!frame) {
        setDragState(null)
        return
      }

      const deltaX = event.clientX - activeDrag.startedAt.x
      const deltaY = event.clientY - activeDrag.startedAt.y
      const movedEnough = Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD

      if (!movedEnough) {
        onPointClick?.(activeDrag.point.id)
        setDragState(null)
        return
      }

      const nextPlotPosition = getNormalizedPlotPosition(frame, {
        x: event.clientX,
        y: event.clientY,
      })
      const { importancePosition, urgencyPosition } = getProjectedReorder(
        points,
        activeDrag.point,
        nextPlotPosition,
      )

      try {
        await commitReorder(activeDrag.point.id, {
          importancePosition,
          urgencyPosition,
        })
        setDragState(null)
        setHoveredPoint(null)
        setReorderError(null)
      } catch (error) {
        setDragState(null)
        setHoveredPoint(null)
        setReorderError(
          error instanceof Error
            ? error.message
            : 'Something went wrong while reordering the task.',
        )
        console.error('Failed to reorder task.', error)
      }
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerId !== activeDrag.pointerId) {
        return
      }

      setDragState((current) =>
        current
          ? {
              ...current,
              currentAt: {
                x: event.clientX,
                y: event.clientY,
              },
            }
          : current,
      )
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState, onPointClick, onPointReorder, points])

  const InteractiveNodesLayer = useCallback(
    (layerProps: { nodes: InteractiveNode[] }) => (
      <g>
        {layerProps.nodes.map((node) => {
          const isCurrent = node.data.id === currentTaskId
          const isDragging = dragState?.point.id === node.data.id

          return (
            <circle
              key={node.data.id}
              cx={node.x}
              cy={node.y}
              fill={isCurrent ? 'var(--accent-ink)' : 'var(--moss)'}
              opacity={isDragging ? 0.28 : 1}
              r={isCurrent ? 10 : 8}
              stroke="rgba(255,248,240,0.95)"
              strokeWidth={2}
              style={{ cursor: isInteractive ? 'grab' : 'default' }}
              onMouseEnter={() => {
                if (!isInteractive || dragState) {
                  return
                }
                setHoveredPoint({
                  point: node.data,
                  x: node.x + CHART_MARGIN.left,
                  y: node.y + CHART_MARGIN.top,
                })
              }}
              onMouseLeave={() => {
                if (!dragState) {
                  setHoveredPoint(null)
                }
              }}
              onPointerDown={(event) => {
                if (!onPointReorder) {
                  return
                }

                event.preventDefault()
                setReorderError(null)
                setDragState({
                  point: node.data,
                  pointerId: event.pointerId,
                  startedAt: { x: event.clientX, y: event.clientY },
                  currentAt: { x: event.clientX, y: event.clientY },
                })
              }}
            />
          )
        })}
      </g>
    ),
    [currentTaskId, dragState, isInteractive, onPointReorder],
  )

  const dragGhost = useMemo(() => {
    if (!dragState || !plotFrameRef.current) {
      return null
    }

    const frame = plotFrameRef.current.getBoundingClientRect()
    return {
      x: dragState.currentAt.x - frame.left,
      y: dragState.currentAt.y - frame.top,
    }
  }, [dragState])

  const projectedRanks = projectedDrag
    ? {
        importance: projectedDrag.importancePosition + 1,
        urgency: projectedDrag.urgencyPosition + 1,
      }
    : null

  if (!mounted) {
    return (
      <div className="matrix-card flex h-[420px] items-center justify-center rounded-[1.8rem] border border-[var(--line)] bg-[var(--panel)]">
        <div className="text-center">
          <p className="eyebrow">Loading</p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">Preparing your ranking field...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="matrix-card h-[420px] overflow-visible rounded-[1.8rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(254,250,245,0.96),rgba(244,238,228,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="flex h-full min-h-0 flex-col">
        {subtitle ? <p className="px-3 pb-2 text-xs uppercase tracking-[0.2em] text-[var(--muted-ink)]">{subtitle}</p> : null}
        {reorderError ? (
          <p className="px-3 pb-2 text-sm text-[var(--tone-drop)]">{reorderError}</p>
        ) : null}
        <div ref={plotFrameRef} className="relative min-h-0 flex-1">
          <ResponsiveScatterPlot<PointDatum>
            data={data}
            margin={CHART_MARGIN}
            xScale={{ type: 'linear', min: 0, max: 1 }}
            xFormat=">-.2f"
            yScale={{ type: 'linear', min: 0, max: 1 }}
            yFormat=">-.2f"
            axisBottom={{
              legend: 'Importance percentile',
              legendOffset: 42,
              legendPosition: 'middle',
              tickValues: [0, 0.25, 0.5, 0.75, 1],
            }}
            axisLeft={{
              legend: 'Urgency percentile',
              legendOffset: -48,
              legendPosition: 'middle',
              tickValues: [0, 0.25, 0.5, 0.75, 1],
            }}
            colors={['var(--moss)', 'var(--accent-ink)']}
            blendMode="normal"
            nodeSize={16}
            isInteractive={false}
            useMesh={false}
            theme={{
              grid: {
                line: {
                  stroke: 'rgba(93, 85, 74, 0.16)',
                },
              },
              axis: {
                ticks: {
                  line: { stroke: 'rgba(93, 85, 74, 0.25)' },
                  text: { fill: 'var(--muted-ink)', fontSize: 11 },
                },
                legend: {
                  text: { fill: 'var(--muted-ink)', fontSize: 12 },
                },
              },
            }}
            layers={[
              MatrixRegionsLayer,
              'grid',
              'axes',
              InteractiveNodesLayer,
              'legends',
            ]}
          />

          {hoveredPoint && !dragState && isInteractive ? (
            <div
              className={cn(
                'pointer-events-none absolute z-20 max-w-[240px] rounded-3xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 shadow-[0_20px_60px_rgba(25,20,18,0.16)]',
              )}
              style={{
                left: hoveredPoint.x,
                top: hoveredPoint.y,
                transform:
                  hoveredPoint.y < 84
                    ? 'translate(-50%, 12px)'
                    : 'translate(-50%, calc(-100% - 14px))',
              }}
            >
              <p className="font-display text-base font-semibold text-[var(--ink)]">
                {hoveredPoint.point.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-ink)]">
                {hoveredPoint.point.description || 'No description'}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                {hoveredPoint.point.resolutionType
                  ? resolutionLabels[hoveredPoint.point.resolutionType]
                  : 'Unresolved'}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                {formatShortDueDate(hoveredPoint.point.dueDate)}
              </p>
            </div>
          ) : null}

          {dragGhost && dragState ? (
            <>
              <div
                className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[rgba(108,57,38,0.18)]"
                style={{ left: dragGhost.x }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 z-10 h-px bg-[rgba(108,57,38,0.18)]"
                style={{ top: dragGhost.y }}
              />
              <div
                className="pointer-events-none absolute z-10 h-6 w-6 rounded-full border-2 border-[var(--accent-ink)] bg-[rgba(108,57,38,0.14)]"
                style={{
                  left: dragGhost.x,
                  top: dragGhost.y,
                  transform: 'translate(-50%, -50%)',
                }}
              />
              <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
                <div className="rounded-full bg-[var(--panel)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)] shadow-[0_14px_34px_rgba(25,20,18,0.12)]">
                  {projectedRanks
                    ? `Importance #${projectedRanks.importance}  Urgency #${projectedRanks.urgency}`
                    : 'Drag to reorder both dimensions'}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
