import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Id } from '../../../convex/_generated/dataModel'
import type { MatrixPoint } from '@/lib/task-model'
import { resolutionTone } from '@/lib/task-model'
import { formatShortDueDate } from '@/features/tasks/use-task-data'
import { resolutionLabels } from '@/lib/task-model'
import {
  percentileFromRank,
  positionFromPercentile,
} from '@/lib/ranking/task-ranking'

type EisenhowerMatrixProps = {
  currentTaskId?: Id<'tasks'>
  onPointClick?: (taskId: Id<'tasks'>) => void
  onPointReorder?: (
    taskId: Id<'tasks'>,
    next: { importancePosition: number; urgencyPosition: number },
  ) => void | Promise<void>
  points: MatrixPoint[]
}

type PointDatum = MatrixPoint & { x: number; y: number }

type HoverState = {
  point: PointDatum
  svgX: number
  svgY: number
}

type DragState = {
  point: PointDatum
  pointerId: number
  startedAt: { x: number; y: number }
  currentAt: { x: number; y: number }
}

const MARGIN = { top: 32, right: 32, bottom: 48, left: 48 }
const DRAG_THRESHOLD = 8

const QUADRANTS = [
  {
    label: 'DELEGATE',
    xMin: 0, xMax: 0.5, yMin: 0.5, yMax: 1,
    tone: 'var(--tone-delegate)',
    soft: 'var(--tone-delegate-soft)',
    lx: 0.25, ly: 0.25,
  },
  {
    label: 'DO',
    xMin: 0.5, xMax: 1, yMin: 0.5, yMax: 1,
    tone: 'var(--tone-do)',
    soft: 'var(--tone-do-soft)',
    lx: 0.75, ly: 0.25,
  },
  {
    label: 'DROP',
    xMin: 0, xMax: 0.5, yMin: 0, yMax: 0.5,
    tone: 'var(--tone-drop)',
    soft: 'var(--tone-drop-soft)',
    lx: 0.25, ly: 0.75,
  },
  {
    label: 'SCHEDULE',
    xMin: 0.5, xMax: 1, yMin: 0, yMax: 0.5,
    tone: 'var(--tone-schedule)',
    soft: 'var(--tone-schedule-soft)',
    lx: 0.75, ly: 0.75,
  },
]

function getNormalizedPosition(
  frame: DOMRect,
  pointer: { x: number; y: number },
  width: number,
  height: number,
) {
  const innerW = width - MARGIN.left - MARGIN.right
  const innerH = height - MARGIN.top - MARGIN.bottom
  const nx = Math.max(0, Math.min(1, (pointer.x - frame.left - MARGIN.left) / innerW))
  const nyFromTop = Math.max(0, Math.min(1, (pointer.y - frame.top - MARGIN.top) / innerH))
  return { x: nx, y: 1 - nyFromTop }
}

function getProjectedReorder(
  points: PointDatum[],
  dragged: PointDatum,
  nextPos: { x: number; y: number },
) {
  const remaining = points.filter((p) => p.id !== dragged.id)
  const total = points.length
  const importancePosition = positionFromPercentile(nextPos.x, total)
  const urgencyPosition = positionFromPercentile(nextPos.y, total)

  const byImportance = [...remaining].sort((a, b) => a.importanceRank - b.importanceRank)
  byImportance.splice(importancePosition, 0, dragged)

  const byUrgency = [...remaining].sort((a, b) => a.urgencyRank - b.urgencyRank)
  byUrgency.splice(urgencyPosition, 0, dragged)

  const importanceRanks = new Map(byImportance.map((p, i) => [p.id, i]))
  const urgencyRanks = new Map(byUrgency.map((p, i) => [p.id, i]))

  const projectedPoints = points.map((p) => {
    const nextI = importanceRanks.get(p.id) ?? p.importanceRank
    const nextU = urgencyRanks.get(p.id) ?? p.urgencyRank
    return {
      ...p,
      importanceRank: nextI,
      urgencyRank: nextU,
      x: percentileFromRank(nextI, total),
      y: percentileFromRank(nextU, total),
    }
  })

  return { importancePosition, urgencyPosition, projectedPoints }
}

export function EisenhowerMatrix({
  currentTaskId,
  onPointClick,
  onPointReorder,
  points,
}: EisenhowerMatrixProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 600, height: 480 })
  const [hovered, setHovered] = useState<HoverState | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)
  const isInteractive = Boolean(onPointClick || onPointReorder)
  const supportsColorMix = useMemo(
    () =>
      typeof CSS !== 'undefined' &&
      CSS.supports('color', 'color-mix(in srgb, red 0%, white 100%)'),
    [],
  )

  // Track container size
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    obs.observe(el)
    // initial
    setSize({ width: el.clientWidth, height: el.clientHeight })
    return () => obs.disconnect()
  }, [])

  const { width, height } = size
  const innerW = width - MARGIN.left - MARGIN.right
  const innerH = height - MARGIN.top - MARGIN.bottom

  function toSvgX(nx: number) {
    return MARGIN.left + nx * innerW
  }
  function toSvgY(ny: number) {
    return MARGIN.top + (1 - ny) * innerH
  }

  const projectedDrag = useMemo(() => {
    if (!dragState || !containerRef.current) return null
    const frame = containerRef.current.getBoundingClientRect()
    const nextPos = getNormalizedPosition(frame, dragState.currentAt, width, height)
    return getProjectedReorder(points, dragState.point, nextPos)
  }, [dragState, points, width, height])

  const renderedPoints = projectedDrag?.projectedPoints ?? points

  // Drag pointer events
  useEffect(() => {
    if (!dragState || !onPointReorder) return
    const activeDrag = dragState
    const commit = onPointReorder

    async function handlePointerUp(e: PointerEvent) {
      if (e.pointerId !== activeDrag.pointerId) return

      const frame = containerRef.current?.getBoundingClientRect()
      if (!frame) { setDragState(null); return }

      const dx = e.clientX - activeDrag.startedAt.x
      const dy = e.clientY - activeDrag.startedAt.y
      const moved = Math.hypot(dx, dy) > DRAG_THRESHOLD

      if (!moved) {
        onPointClick?.(activeDrag.point.id)
        setDragState(null)
        return
      }

      const nextPos = getNormalizedPosition(frame, { x: e.clientX, y: e.clientY }, width, height)
      const { importancePosition, urgencyPosition } = getProjectedReorder(
        points, activeDrag.point, nextPos,
      )
      try {
        await commit(activeDrag.point.id, { importancePosition, urgencyPosition })
        setDragState(null)
        setHovered(null)
        setReorderError(null)
      } catch (err) {
        setDragState(null)
        setHovered(null)
        setReorderError(err instanceof Error ? err.message : 'Reorder failed.')
      }
    }

    function handlePointerMove(e: PointerEvent) {
      if (e.pointerId !== activeDrag.pointerId) return
      setDragState((cur) =>
        cur ? { ...cur, currentAt: { x: e.clientX, y: e.clientY } } : cur,
      )
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState, onPointClick, onPointReorder, points, width, height])

  // Ghost cursor position in SVG coords
  const ghostSvg = useMemo(() => {
    if (!dragState || !containerRef.current) return null
    const frame = containerRef.current.getBoundingClientRect()
    return {
      x: dragState.currentAt.x - frame.left,
      y: dragState.currentAt.y - frame.top,
    }
  }, [dragState])

  const projectedRanks = projectedDrag
    ? { importance: projectedDrag.importancePosition + 1, urgency: projectedDrag.urgencyPosition + 1 }
    : null

  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent, point: PointDatum) => {
      if (!onPointReorder) return
      e.preventDefault()
      setReorderError(null)
      setDragState({
        point,
        pointerId: e.pointerId,
        startedAt: { x: e.clientX, y: e.clientY },
        currentAt: { x: e.clientX, y: e.clientY },
      })
    },
    [onPointReorder],
  )

  const handleNodeActivate = useCallback(
    (point: PointDatum) => {
      onPointClick?.(point.id)
    },
    [onPointClick],
  )

  const handleNodeKeyDown = useCallback(
    (e: React.KeyboardEvent, point: PointDatum) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      handleNodeActivate(point)
    },
    [handleNodeActivate],
  )

  return (
    <div ref={containerRef} className="matrix-container" style={{ position: 'relative' }}>
      {reorderError && (
        <div
          style={{ position: 'absolute', top: 8, left: MARGIN.left, right: MARGIN.right, zIndex: 10 }}
          className="rounded-md border border-(--tone-drop) bg-(--tone-drop-soft) px-3 py-1.5 text-xs text-(--tone-drop)"
        >
          {reorderError}
        </div>
      )}

      <svg
        width={width}
        height={height}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Quadrant backgrounds */}
        {innerW > 0 && innerH > 0 && QUADRANTS.map((q) => (
          <g key={q.label}>
            <rect
              x={toSvgX(q.xMin)}
              y={toSvgY(q.yMax)}
              width={innerW * (q.xMax - q.xMin)}
              height={innerH * (q.yMax - q.yMin)}
              fill={q.soft}
            />
            <text
              x={toSvgX(q.lx)}
              y={toSvgY(1 - q.ly)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={q.tone}
              fontSize={14}
              fontWeight={800}
              letterSpacing="0.22em"
              opacity={0.18}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {q.label}
            </text>
          </g>
        ))}

        {/* Grid lines */}
        {innerW > 0 && [0.25, 0.5, 0.75].map((t) => (
          <g key={t}>
            <line
              x1={toSvgX(t)} y1={MARGIN.top}
              x2={toSvgX(t)} y2={MARGIN.top + innerH}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
              strokeDasharray={t === 0.5 ? '4 4' : undefined}
            />
            <line
              x1={MARGIN.left} y1={toSvgY(t)}
              x2={MARGIN.left + innerW} y2={toSvgY(t)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
              strokeDasharray={t === 0.5 ? '4 4' : undefined}
            />
          </g>
        ))}

        {/* Border */}
        {innerW > 0 && (
          <rect
            x={MARGIN.left} y={MARGIN.top}
            width={innerW} height={innerH}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        )}

        {/* Axis labels */}
        {innerW > 0 && (
          <>
            <text
              x={MARGIN.left + innerW / 2}
              y={height - 8}
              textAnchor="middle"
              fill="var(--text-tertiary)"
              fontSize={10}
              fontWeight={600}
              letterSpacing="0.14em"
              style={{ userSelect: 'none' }}
            >
              IMPORTANCE
            </text>
            <text
              x={12}
              y={MARGIN.top + innerH / 2}
              textAnchor="middle"
              fill="var(--text-tertiary)"
              fontSize={10}
              fontWeight={600}
              letterSpacing="0.14em"
              transform={`rotate(-90, 12, ${MARGIN.top + innerH / 2})`}
              style={{ userSelect: 'none' }}
            >
              URGENCY
            </text>
          </>
        )}

        {/* Task points */}
        {innerW > 0 && renderedPoints.map((point) => {
          const px = toSvgX(point.x)
          const py = toSvgY(point.y)
          const isCurrent = point.id === currentTaskId
          const isDragging = dragState?.point.id === point.id
          const tone = point.resolutionType
            ? resolutionTone[point.resolutionType]
            : 'var(--text-tertiary)'
          const r = isCurrent ? 9 : 7
          const opacity = isDragging ? 0.25 : (dragState && !isCurrent ? 0.55 : 1)
          const pointTransition = dragState ? undefined : 'cx 200ms ease, cy 200ms ease'
          const fillTone = supportsColorMix
            ? `color-mix(in srgb, ${tone} 20%, var(--bg-raised))`
            : tone
          const fillOpacity = supportsColorMix ? undefined : 0.2

          return (
            <g
              key={point.id}
              opacity={opacity}
              style={{
                cursor: isInteractive ? (isDragging ? 'grabbing' : 'grab') : 'default',
              }}
              role={onPointClick ? 'button' : undefined}
              tabIndex={onPointClick ? 0 : undefined}
              aria-label={onPointClick ? `Open task ${point.title}` : undefined}
              onMouseEnter={() => {
                if (!isInteractive || dragState) return
                setHovered({ point, svgX: px, svgY: py })
              }}
              onMouseLeave={() => {
                if (!dragState) setHovered(null)
              }}
              onClick={() => handleNodeActivate(point)}
              onKeyDown={(e) => handleNodeKeyDown(e, point)}
              onPointerDown={(e) => handleNodePointerDown(e, point)}
            >
              {/* Glow ring for current task */}
              {isCurrent && (
                <circle
                  cx={px}
                  cy={py}
                  r={r + 5}
                  fill={tone}
                  opacity={0.15}
                  style={{ transition: pointTransition }}
                />
              )}
              {/* Outer ring */}
              <circle
                cx={px} cy={py}
                r={r + 2}
                fill="none"
                stroke={tone}
                strokeWidth={1.5}
                opacity={0.5}
                style={{ transition: pointTransition }}
              />
              {/* Fill */}
              <circle
                cx={px} cy={py}
                r={r}
                fill={fillTone}
                fillOpacity={fillOpacity}
                stroke={tone}
                strokeWidth={1.5}
                style={{ transition: pointTransition }}
              />
            </g>
          )
        })}

        {/* Drag ghost crosshairs */}
        {ghostSvg && dragState && innerW > 0 && (
          <>
            <line
              x1={ghostSvg.x} y1={MARGIN.top}
              x2={ghostSvg.x} y2={MARGIN.top + innerH}
              stroke="var(--accent)"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.4}
              style={{ pointerEvents: 'none' }}
            />
            <line
              x1={MARGIN.left} y1={ghostSvg.y}
              x2={MARGIN.left + innerW} y2={ghostSvg.y}
              stroke="var(--accent)"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.4}
              style={{ pointerEvents: 'none' }}
            />
            <circle
              cx={ghostSvg.x} cy={ghostSvg.y}
              r={10}
              fill="var(--accent-soft)"
              stroke="var(--accent)"
              strokeWidth={2}
              style={{ pointerEvents: 'none' }}
            />
          </>
        )}
      </svg>

      {/* Hover tooltip */}
      {hovered && !dragState && isInteractive && (
        <div
          style={{
            position: 'absolute',
            left: hovered.svgX,
            top: hovered.svgY,
            transform:
              hovered.svgY < height / 2
                ? 'translate(-50%, 16px)'
                : 'translate(-50%, calc(-100% - 16px))',
            pointerEvents: 'none',
            zIndex: 20,
          }}
          className="rounded-xl border border-(--border-strong) bg-(--bg-raised) px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.5)] max-w-[220px]"
        >
          <p className="text-(--text-primary) text-sm font-semibold leading-tight">
            {hovered.point.title}
          </p>
          {hovered.point.description && (
            <p className="mt-1 text-(--text-secondary) text-xs leading-5 line-clamp-2">
              {hovered.point.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            {hovered.point.resolutionType && (
              <span
                className="text-xs font-semibold uppercase tracking-[0.1em]"
                style={{ color: resolutionTone[hovered.point.resolutionType] }}
              >
                {resolutionLabels[hovered.point.resolutionType]}
              </span>
            )}
            {hovered.point.dueDate && (
              <span className="text-(--text-tertiary) text-xs">
                {formatShortDueDate(hovered.point.dueDate)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Drag rank indicator */}
      {dragState && projectedRanks && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
          className="rounded-full border border-(--border-strong) bg-(--bg-raised) px-4 py-1.5 text-(--text-secondary) text-xs font-bold tracking-[0.12em] uppercase shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        >
          Importance #{projectedRanks.importance} · Urgency #{projectedRanks.urgency}
        </div>
      )}
    </div>
  )
}
