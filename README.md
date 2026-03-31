# Eisenhower Todo

Eisenhower Todo is a local-first single-user task management MVP built with
TanStack Start, TypeScript, Tailwind CSS, shadcn/ui-style components, Convex,
and Nivo.

The app keeps two independent ordered rankings for active tasks:

- Importance
- Urgency

Those ordered list positions are stored as integer ranks. Percentiles are
derived from the active ranking universe and visualized on a 2D scatter plot.

## Stack

- TanStack Start in SPA mode
- TypeScript
- Tailwind CSS v4
- shadcn/ui-style component primitives
- Convex with local deployments for development
- Nivo scatter plot
- Vitest

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Start Convex in local deployment mode. Keep this running in a separate
terminal:

```bash
npm run convex:dev
```

This writes `.env.local`, starts the local Convex backend, and generates the
Convex client files in `convex/_generated`.

3. Seed sample data in another terminal:

```bash
npm run seed
```

4. Start the frontend:

```bash
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run typecheck
npm run convex:dev
npm run seed
```

## How ranking works

- Only tasks with `status = "active"` participate in ranking and percentile
  calculations.
- `importanceRank` and `urgencyRank` are integer ordered positions where `0` is
  the highest rank.
- Creating a task inserts it into both ordered lists at the chosen positions and
  shifts lower-ranked active tasks down.
- Re-ranking updates only the selected dimension and then recomputes ranks and
  percentiles for the active task universe.
- Percentiles use `rank / (totalTasks - 1)`.
- If only one active task exists, both percentiles resolve to `0`.

## Views

- Matrix view: primary Nivo scatter plot with hover tooltip and click-through to
  task detail
- List view: sortable table across active, completed, and archived tasks
- Task detail: full task information, edit dialog, and contextual mini matrix

## Data layer

Convex is responsible for:

- storing tasks
- maintaining active ranks
- recalculating percentiles
- serving ordered views and matrix data
- seeding representative sample tasks

## Testing

The included tests cover the pure ranking and percentile logic in
`src/lib/ranking/task-ranking.test.ts`.
