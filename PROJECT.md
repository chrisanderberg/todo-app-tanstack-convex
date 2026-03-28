# PROJECT.md

## Overview
This project is a local-first MVP web app called `Eisenhower Todo` for
capturing, ranking, and resolving personal tasks.

The product is inspired by the Eisenhower method, but it does not place tasks
into fixed quadrants. Instead, each task lives in two independent ordered
lists: one for importance and one for urgency. The app derives percentiles from
those orderings and visualizes tasks on a 2D matrix scatter plot.

The current intent is to build something practical quickly, learn through
implementation, and keep the project documentation aligned with reality instead
of maintaining a large speculative spec.

## Goals
- Deliver a working single-user local-first MVP using TanStack Start,
  TypeScript, Tailwind CSS, shadcn/ui, Convex, and Nivo.
- Make ranking the core interaction by letting users insert and reorder tasks
  independently by importance and urgency.
- Visualize the derived importance and urgency percentiles in a main matrix
  view, a mini matrix context view, and a supporting list/detail workflow.

## Non-goals
- Do not implement hard quadrant classification logic for tasks.
- Do not implement AI-generated rankings in v1, even though the ranking system
  should be designed so AI ranking can be added later.
- Do not build multi-user collaboration, sync conflict resolution, or a broad
  team workflow for this MVP.

## Core domain concepts
- Todo item
- Independent importance ranking
- Independent urgency ranking
- Derived percentile-based matrix position
- Resolution type: `do`, `schedule`, `delegate`, or `drop`
- Task lifecycle state: `active`, `completed`, or `archived`

## Current instruction model
- `AGENTS.md` defines how agents should operate in this worktree.
- `PROJECT.md` defines the project, intent, and current goals.
- `REQUIREMENTS.md` defines the current implementation contract.
- `REQUIREMENTS.md` may also carry durable rationale for settled design choices
  when that context helps future implementation.

## How to use this file
- Read this file first to understand project intent and scope.
- Read `REQUIREMENTS.md` next before implementing behavior.
- Use `REQUIREMENTS.md` as the source for constraints, defaults, and durable
  implementation guidance.

## Scope guidance
- Treat `PROJECT.md` as the place for stable project description and goals.
- Do not turn this file into a changelog, scratchpad, or task tracker.
- Add context here when it helps future agents understand why the project
  exists or what broad direction it is taking.
- Keep this file high level even as implementation details evolve.
