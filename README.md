# Iterative Greenfield Project Template

This template is for starting new projects without writing a full upfront spec.

It assumes:
- project understanding will improve during implementation
- requirements will be discovered through prototyping
- durable guidance should be captured as it emerges
- the canonical project docs should stay small and reviewable

## Files
- `PROJECT.md`: stable project intent, goals, and broad domain shape
- `REQUIREMENTS.md`: current implementation contract and reusable guidance
- `AGENTS.md`: working instructions for coding agents in this repo
- `BOOTSTRAP_PROMPT.md`: prompt template for turning a short project description into an initialized repo context

## Intended workflow
1. Start a new repo.
2. Copy these files into the repo root.
3. Fill in the placeholders manually or paste `BOOTSTRAP_PROMPT.md` into the model with your project description.
4. Begin implementing.
5. When implementation reveals durable behavior, defaults, invariants, mappings, or constraints, update `REQUIREMENTS.md`.
6. Keep `PROJECT.md` stable and high level. Do not turn it into a task log.

## Philosophy
- Do not demand exhaustive specs before coding starts.
- Do not silently invent requirements either.
- Keep hard requirements small and intentional.
- Let soft requirements accumulate as durable lessons from real implementation.
- Prefer one canonical place for each kind of information.

## Recommended doc ownership
- `PROJECT.md`: why this project exists, what it is, what success looks like
- `REQUIREMENTS.md`: what is currently binding or preferred for implementation
- `AGENTS.md`: how agents should read and use the other docs while working
