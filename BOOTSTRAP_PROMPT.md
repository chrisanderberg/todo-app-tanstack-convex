# Bootstrap Prompt

Use this prompt to initialize a new greenfield repo from the template.

```text
You are setting up a new software project.

Use the repo-root files `AGENTS.md`, `PROJECT.md`, and `REQUIREMENTS.md` as the
canonical documentation model.

Documentation strategy:
- Do not create a large upfront spec unless explicitly requested.
- Keep `PROJECT.md` high level and stable.
- Keep `REQUIREMENTS.md` as the living implementation contract.
- Put durable guidance discovered during implementation into
  `REQUIREMENTS.md`.
- Keep hard requirements small and explicit.
- Add soft requirements as reusable lessons from real work.

Project description:
[PASTE PROJECT DESCRIPTION HERE]

Your tasks:
1. Fill in `PROJECT.md` so it accurately describes the project overview, goals,
   non-goals, and core domain concepts.
2. Fill in `REQUIREMENTS.md` with a minimal but useful starting contract:
   a small set of hard requirements and a reasonable set of soft requirements.
3. Fill in `AGENTS.md` so agents know how to use `PROJECT.md` and
   `REQUIREMENTS.md` while implementing the project.
4. Keep the docs concise. Do not create extra planning/spec/decision files
   unless the project clearly needs them or the human asks for them.
5. After filling the docs, scaffold the project and begin implementation.
6. When implementation reveals durable new guidance, update `REQUIREMENTS.md`
   in the same change.

Constraints:
- Prefer pragmatic, reviewable structure over speculative architecture.
- Do not silently invent product requirements that were not implied by the
  description.
- If an important requirement is missing, either make the narrowest safe
  assumption or ask for clarification.
- Keep the repo easy for future agents to understand.
```
