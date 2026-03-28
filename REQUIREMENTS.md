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
- The system shall be implemented as [TECH_STACK_OR_RUNTIME].
- The system shall remain simple to run locally using the documented project
  commands.
- [HARD_REQUIREMENT_1]
- [HARD_REQUIREMENT_2]

## Soft requirements
- Prefer simple designs that keep the import graph and runtime topology easy to
  understand.
- Prefer capturing reusable implementation guidance here instead of scattering
  it across separate planning or decision files.
- Prefer documenting behavior that implementation proves necessary, rather than
  trying to guess every durable rule before coding begins.
- Prefer brief comments around non-obvious invariants, edge-case handling,
  fallback behavior, or domain-model translations.
- [SOFT_REQUIREMENT_1]
- [SOFT_REQUIREMENT_2]

## Candidate promotions to hard requirements
- None yet.

## Open questions
- None yet.

## Maintenance rules
- Add new hard requirements only with explicit human approval.
- Add or refine soft requirements when implementation reveals reusable defaults,
  constraints, mappings, invariants, or UI behavior that should persist.
- Do not use this file as a status log.
- Remove superseded guidance when it no longer reflects the current direction.
