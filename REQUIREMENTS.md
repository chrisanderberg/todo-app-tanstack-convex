# REQUIREMENTS.md

## Purpose
This file tracks the current implementation contract for the project. It may be
partially defined upfront and extended as development proceeds.

## How to interpret this file
- Hard requirements are mandatory. Agents must not violate them unless the
  human explicitly changes or approves an exception.
- Soft requirements are recommended defaults. Agents should follow them unless
  there is a clear, task-specific reason not to.
- Human approval is required before adding, removing, or changing a hard
  requirement.

## Hard requirements
- The system shall be implemented as a local-first single-user web application
  called `Eisenhower Todo`.
- The system shall use TanStack Start, TypeScript, Tailwind CSS, shadcn/ui,
  Convex, and Nivo.
- The system shall remain simple to run locally using the documented project
  commands.
- The system shall keep `PROJECT.md` and `REQUIREMENTS.md` as the canonical
  project documentation during implementation.
- The system shall model importance and urgency as two independent ordered rank
  lists, not numeric user-entered scores.
- The system shall store integer `importanceRank` and `urgencyRank` positions
  where rank `0` is highest priority in that dimension.
- The system shall derive `importancePercentile` and `urgencyPercentile` from
  rank order using `rank / (totalTasks - 1)` and shall handle the single-task
  edge case safely.
- The system shall allow inserting a task at any position in the importance
  ordering and at any position in the urgency ordering, shifting lower-ranked
  tasks accordingly.
- The system shall allow reordering tasks independently in either ranking
  dimension and shall recompute ranks and percentiles after every relevant
  change.
- The system shall provide a main matrix view where each task is rendered as a
  scatter-plot point with x = importance percentile and y = urgency
  percentile.
- The system shall include a task detail view, a mini matrix view for the
  current task context, and a list view showing both rank positions.
- The system shall store tasks in Convex and keep ranking maintenance and
  percentile recomputation in the Convex data layer.
- The system shall include seed data, tests for ranking and percentile logic, a
  working local setup, and a README describing setup and behavior.
- The system shall not implement fixed quadrant assignment logic.
- The system shall not implement AI ranking in v1.

## Soft requirements
- Prefer simple designs that keep the import graph and runtime topology easy to
  understand.
- Prefer capturing reusable implementation guidance here instead of scattering
  it across separate planning or decision files.
- Prefer documenting behavior that implementation proves necessary, rather than
  trying to guess every durable rule before coding begins.
- Prefer brief comments around non-obvious invariants, edge-case handling,
  fallback behavior, or domain-model translations.
- Prefer separating ranking logic, data access, and UI concerns into distinct
  modules.
- Prefer implementing ranking math in reusable pure utilities so it can be
  tested independently from Convex and the UI.
- Prefer reusable hooks for ranking operations and percentile-oriented view
  state.
- Prefer desktop-first layout while remaining responsive on smaller screens.
- Prefer visual hints for `do`, `schedule`, `delegate`, and `drop` regions
  without treating those regions as hard classification rules.
- Prefer smooth editing flows through a modal or drawer unless a specific task
  makes another interaction model clearly better.

## Candidate promotions to hard requirements
- None yet.

## Open questions
- Exact route structure, component boundaries, and local command names will be
  finalized during scaffolding and implementation.

## Maintenance rules
- Add new hard requirements only with explicit human approval.
- Add or refine soft requirements when implementation reveals reusable defaults,
  constraints, mappings, invariants, or UI behavior that should persist.
- Do not use this file as a status log.
- Remove superseded guidance when it no longer reflects the current direction.
