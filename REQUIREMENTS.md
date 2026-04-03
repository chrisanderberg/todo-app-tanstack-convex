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
- Prefer TanStack Start SPA mode for this project so Convex live queries and
  browser-only chart rendering stay simple and predictable.
- Prefer keeping the top-level `.gitignore` explicit about local environment
  files, local Convex state, logs, and generated build artifacts instead of
  relying on nested tool-generated ignore files.
- Prefer direct-commit interactions for task editing where practical,
  especially for ranking changes, so the user does not need an extra save step
  after choosing a new position.
- Prefer offering direct manipulation for ranking in both the ordered list
  views and the main matrix when the interaction remains understandable.
- Prefer drag-and-drop as the primary ranking interaction in views that present
  ordered tasks spatially or sequentially.
- Prefer live local preview reordering during drag interactions so surrounding
  tasks visibly reshuffle before commit, while persisting the final order only
  after drop or pointer release.
- Prefer pairing drag-and-drop ranking interactions with simple button-based or
  keyboard-friendly move controls so ranking remains usable on touch devices
  and without precise pointer dragging.
- Prefer non-essential UI motion to respect `prefers-reduced-motion`, and keep
  pointer-driven drag interactions resilient to cancellation or collapsed
  layouts so rankings do not produce invalid positions during edge cases.
- Prefer the main route to open directly into the working task data and primary
  controls rather than a marketing-style or onboarding-style hero section.
- Prefer the main matrix route to surface live task summaries such as due soon,
  unresolved, and top-ranked tasks so the screen acts as an operational
  dashboard rather than static explanation.
- Prefer visual hints for `do`, `schedule`, `delegate`, and `drop` regions
  without treating those regions as hard classification rules.
- Prefer smooth editing flows through a modal or drawer unless a specific task
  makes another interaction model clearly better.
- Prefer direct-commit editing surfaces to show explicit saving, saved, and
  failure feedback so the user can trust that inline changes actually landed.

## Candidate promotions to hard requirements
- None yet.

## Open questions
- None currently.

## Maintenance rules
- Add new hard requirements only with explicit human approval.
- Add or refine soft requirements when implementation reveals reusable defaults,
  constraints, mappings, invariants, or UI behavior that should persist.
- Do not use this file as a status log.
- Remove superseded guidance when it no longer reflects the current direction.
