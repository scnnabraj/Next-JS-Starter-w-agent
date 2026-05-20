# Copilot instructions for this repository

Follow `AGENTS.md` as the primary source of truth for architecture, data fetching, forms, and component conventions.

## Objective

When assigned a task, Copilot should:

1. Review relevant files.
2. Propose and apply minimal safe changes.
3. Validate changes.
4. Commit and push to a branch (when running in an environment with git push permissions).
5. Open or update a Pull Request with a clear summary.

## Required standards

- Enforce module-based structure under `src/modules/*`.
- Use aliases from `tsconfig.json` (no `src/modules/...` long imports when alias exists).
- No module root barrel files.
- Data access rules:
  - Server reads: `@/utils/execute-fetch`
  - Client reads: `@/core/hooks/useQueryFetch`
  - Mutations: `@/core/hooks/useMutationQuery`
- Forms: `zod` + `react-hook-form` (+ `@hookform/resolvers/zod`), UI via `shadcn/ui`.
- Components:
  - One folder per component
  - `index.tsx` entry
  - Arrow function components
- Keep `src/app/*` route files thin and delegate to module `pages/`.

## Change workflow

1. Read task + inspect affected module(s).
2. Make focused edits only in relevant files.
3. Preserve backward compatibility unless task explicitly allows breaking changes.
4. Run project checks before commit:
   - `pnpm lint`
   - `pnpm build` (if change can affect build/runtime)
5. Include/update types and error handling.
6. Update docs when conventions or behavior change.

## Commit and PR policy

- Never push directly to `main`.
- Create/use a task branch: `copilot/<short-task-name>`.
- Commit message format:
  - `feat: ...`
  - `fix: ...`
  - `refactor: ...`
  - `docs: ...`
  - `test: ...`
- PR description must include:
  - What changed
  - Why
  - Risk/impact
  - Validation steps run

## Safety constraints

- Do not add secrets/tokens to code or logs.
- Avoid destructive git operations.
- Do not modify unrelated files.
- If requirements conflict, prefer `AGENTS.md` and explain the conflict in PR notes.

## If push is not possible

If the runtime does not allow git push/PR actions, still:
1. Apply code changes locally,
2. Provide exact commit message,
3. Provide exact push and PR commands for a maintainer to run.