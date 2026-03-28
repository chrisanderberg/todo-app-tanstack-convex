# AGENTS.md

## Purpose
- This file defines how agents should operate in this worktree.
- Read `PROJECT.md` for project context and goals.
- Read `REQUIREMENTS.md` for the current implementation contract.

## Source of truth
- `PROJECT.md` and `REQUIREMENTS.md` together are the effective project spec.
- If `PROJECT.md` and `REQUIREMENTS.md` conflict, `REQUIREMENTS.md` wins for
  implementation details and constraints.
- `REQUIREMENTS.md` contains both active requirements and durable implementation
  guidance discovered during real work.

## Requirement handling
- Hard requirements are binding. Do not violate them unless the human explicitly
  changes or waives them.
- Soft requirements are preferred guidance. Follow them by default, but you may
  deviate when there is a clear task-specific reason.
- Agents may add or refine soft requirements when they discover reusable
  guidance during implementation.
- Agents must not silently create, remove, or weaken hard requirements.
- If a soft requirement appears important enough to become mandatory, add it to
  the `Candidate promotions to hard requirements` section in `REQUIREMENTS.md`
  instead of promoting it directly.
- Durable rationale should live with the relevant requirement in
  `REQUIREMENTS.md`, not in a separate decision file unless the human asks for
  one.

## Requirements update checkpoint
- Before declaring work complete, review whether the task introduced any new
  reusable defaults, constraints, mappings, invariants, or UI behavior that
  should persist beyond the immediate change.
- If yes, update `REQUIREMENTS.md` in the same change.
- If no, explicitly say that no reusable guidance was discovered.
- Do not finish a task that changes behavior or validation without considering
  whether that behavior belongs in `REQUIREMENTS.md`.

## Execution rules
- If something is not specified, do not guess silently.
- Make the narrowest safe assumption when needed and record it in
  `REQUIREMENTS.md` if it is likely to matter again.
- Prefer parameterization over hardcoding when requirements are still evolving.
- Keep code structure reviewable. Split large functions into focused helpers
  when practical.
- Add brief comments only where intent or invariants are not obvious from the
  code.
- Treat ranking behavior as critical domain logic. Keep the ranking math easy
  to test and avoid burying it inside UI components.
- Preserve the distinction between ordered ranks and derived percentiles.
  Do not replace the ranking model with raw numeric scoring.
- Keep fixed quadrant logic out of the product unless the human explicitly asks
  for it later.

## Definition of done
- The relevant tests pass.
- No placeholder TODO sentinels remain in production code unless explicitly
  approved.
- Non-obvious logic has comments explaining intent or invariants where needed.
- `REQUIREMENTS.md` has been reviewed for reusable guidance introduced by the
  task.
- The final response states either what was added to `REQUIREMENTS.md` or that
  no reusable guidance was discovered.

## Commands
```bash
# Set these to the real project commands as soon as scaffolding is complete.
# Until then, do not invent command names in docs or final status reports.
```
