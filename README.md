# Next.js App Starter

A Next.js 16 App Router starter organized by **feature modules**. Domain logic lives in `src/modules/`; shared infrastructure lives in `core`. Conventions and enforcement rules are defined in [`AGENTS.md`](./AGENTS.md).

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router) |
| React | 19 + React Compiler |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Client data | TanStack React Query v5 |
| HTTP (client) | Axios (`authAxios` / `globalAxios`) |
| HTTP (server) | `executeFetch` wrapper over native `fetch` |
| Forms | Zod + react-hook-form + shadcn/ui |
| Lint / format | Biome |
| Git hooks | Husky + lint-staged |

---

## Getting started

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (required — this repo uses `pnpm-lock.yaml`)

### Setup

```bash
git clone <repo-url>
cd next-app-starter
pnpm install
pnpm prepare   # activate Husky git hooks (run once after clone)
```

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_API_URL=https://your-api.example.com
NEXT_PUBLIC_AUTH_TOKEN_KEY=auth_token
NEXT_PUBLIC_AUTH_ROLE=role
```

### Run locally

```bash
pnpm dev      # http://localhost:3000
pnpm build    # production build
pnpm start    # run production build
```

### IDE setup

Install the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome). The repo includes `.vscode/settings.json` for format-on-save and safe fixes.

---

## Project architecture

```text
src/
├── app/                              # Next.js routes (URLs live here)
│   ├── layout.tsx                    # Root layout + React Query provider
│   ├── page.tsx
│   ├── globals.css
│   └── (auth)/login/page.tsx         # Thin route → delegates to module
│
├── modules/
│   ├── core/                         # Shared, generic utilities only
│   │   ├── components/
│   │   │   ├── Button/index.tsx      # Custom shared components
│   │   │   └── ui/button.tsx         # shadcn/ui primitives (special rules)
│   │   ├── hooks/
│   │   │   ├── useQueryFetch.ts
│   │   │   └── useMutationQuery.ts
│   │   ├── providers/
│   │   │   └── RTKQueryProvider.tsx
│   │   └── utils/
│   │       └── slugify.ts
│   │
│   └── auth/                         # Example feature module
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── types/
│       └── utils/
│
├── utils/                            # App-level utilities
│   ├── execute-fetch.ts              # Server-side fetch + auth cookies
│   └── axios.ts                      # Client-side HTTP clients
│
├── constants/
│   └── index.ts                      # Env-based config
│
└── lib/
    └── utils.ts                      # cn() helper (shadcn)
```

### Key idea: routes vs modules

| Location | Purpose |
|----------|---------|
| `src/app/` | Defines URLs. Keep files thin — import from modules. |
| `src/modules/<name>/` | Owns business logic, UI composition, API calls, types. |

```tsx
// src/app/(auth)/login/page.tsx — thin App Router file
import LoginPage from "@/auth/pages/LoginPage";

export default function Page() {
  return <LoginPage />;
}
```

---

## Module system

Organize by **feature**, not by technical layer at the `src/` root.

### Standard module structure

```text
src/modules/<module-name>/
  components/     # UI only — no API calls
  hooks/          # Orchestrate services + UI/form state
  pages/          # Route-level composition (imported by src/app)
  services/       # API calls and side effects
  types/          # Types, interfaces, Zod schemas
  utils/          # Pure helpers (no side effects)
```

### Layer responsibilities

| Folder | Do | Don't |
|--------|----|-------|
| `components/` | Render UI | Call APIs, axios, fetch, or React Query |
| `services/` | HTTP / business side effects | Render UI |
| `hooks/` | Wire services to components/forms | Contain raw JSX |
| `types/` | Schemas and TypeScript types | Side effects |
| `pages/` | Compose module UI for a route | Define Next.js URLs |

### Import rules

- Import directly from source files via **path aliases** — no root `index.ts` barrels.
- Use module aliases, not full `src/modules/` paths.

```tsx
// Good
import LoginForm from "@/auth/components/LoginForm";
import { useQueryFetch } from "@/core/hooks/useQueryFetch";

// Avoid
import LoginForm from "@/modules/auth/components/LoginForm";
import { LoginForm } from "@/auth";
```

### Path aliases (`tsconfig.json`)

Each module needs an alias before you import from it:

```json
"paths": {
  "@/*": ["./src/*"],
  "@/core/*": ["./src/modules/core/*"],
  "@/auth/*": ["./src/modules/auth/*"]
}
```

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `src/*` |
| `@/core/*` | `src/modules/core/*` |
| `@/auth/*` | `src/modules/auth/*` |

---

## Core module

`src/modules/core/` is the shared foundation. **Only generic, cross-module logic** belongs here — never domain-specific behavior (login flows, checkout, etc.).

Currently provided:

- `useQueryFetch` — client-side reads (React Query + axios)
- `useMutationQuery` — client-side mutations
- `RTKQueryProvider` — React Query provider (used in root layout)
- `slugify` — string helper
- `components/ui/` — shadcn/ui primitives

Feature modules should **compose** core utilities, not duplicate them.

---

## Data fetching

Use the approved utilities only. Do not call `fetch`, `axios`, or React Query hooks directly in components.

### Server reads (initial / critical data)

Use `executeFetch` in **Server Components**:

```tsx
import { executeFetch } from "@/utils/execute-fetch";

const Page = async () => {
  const res = await executeFetch("/users/me", { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch user");
  const user = await res.json();
  return <div>{user.name}</div>;
};
```

### Client reads

Use `useQueryFetch` in **Client Components** (`"use client"`):

```tsx
"use client";
import { useQueryFetch } from "@/core/hooks/useQueryFetch";

const { data, isLoading } = useQueryFetch<User>({
  url: "/users/me",
  queryKeys: ["users", "me"],
});
```

### Mutations

Put HTTP calls in `services/`. Orchestrate with `useMutationQuery` in hooks:

```tsx
"use client";
import { useMutationQuery } from "@/core/hooks/useMutationQuery";

const mutation = useMutationQuery();

mutation.mutate({
  url: "/users",
  method: "post",
  data: payload,
  queryKeys: ["users"],
});
```

### HTTP clients

| Client | Use when |
|--------|----------|
| `authAxios` | Authenticated requests (default) |
| `globalAxios` | Public / unauthenticated endpoints |

Both are configured in `@/utils/axios` with `API_BASE_URL` and auth interceptors.

---

## Forms

Use this file pattern inside a module:

```text
types/<feature>.schema.ts           # Zod schema
components/<Feature>Form/index.tsx  # UI
hooks/use<Feature>Form.ts           # Form + mutation orchestration
services/<feature>.service.ts       # API calls
```

Rules:

1. Define schemas with Zod; infer types via `z.infer<typeof Schema>`.
2. Hooks call `services/` and `useMutationQuery` — components stay UI-only.
3. Use shadcn/ui primitives from `@/core/components/ui/` for form controls.

---

## Component standards

### Default rules (all modules)

- One component per folder: `ComponentName/index.tsx`
- PascalCase folder names
- Arrow function components

```tsx
const UserCard = () => {
  return <div>User Card</div>;
};

export default UserCard;
```

### Exception: shadcn/ui (`core/components/ui/`)

Only shadcn primitives live here. This path bypasses folder and arrow-function rules:

```text
src/modules/core/components/ui/button.tsx   ✓ flat file, function declaration OK
src/modules/auth/components/LoginForm/index.tsx   ✓ standard rules apply
```

Do not put feature or domain components in `ui/`.

### App Router exception

Files in `src/app/` (`layout.tsx`, `page.tsx`) may use `export default function` per Next.js convention.

---

## Adding a new module

Example: creating a `dashboard` module.

**1. Create the folder structure**

```text
src/modules/dashboard/
  components/
  hooks/
  pages/
  services/
  types/
  utils/
```

**2. Register path alias in `tsconfig.json`**

```json
"@/dashboard/*": ["./src/modules/dashboard/*"]
```

**3. Add domain code**

- Types/schemas in `types/`
- API calls in `services/`
- Hooks wiring services to `useQueryFetch` / `useMutationQuery`
- UI in `components/` (one folder per component)
- Page composition in `pages/`

**4. Create a thin App Router file**

```tsx
// src/app/dashboard/page.tsx
import DashboardPage from "@/dashboard/pages/DashboardPage";

export default function Page() {
  return <DashboardPage />;
}
```

**5. Verify before committing**

```bash
pnpm lint
pnpm test
```

---

## Maintaining and refactoring existing modules

### Where to look

| Task | Start here |
|------|------------|
| Change a page's UI | `src/modules/<module>/pages/` and `components/` |
| Change API calls | `src/modules/<module>/services/` |
| Change form logic | `src/modules/<module>/hooks/` + `types/*.schema.ts` |
| Change a URL | `src/app/` route file (keep it thin) |
| Shared data-fetching behavior | `src/modules/core/hooks/` |
| Shared UI primitive | `src/modules/core/components/ui/` (shadcn) |
| Env / API base URL | `.env.local` → `src/constants/index.ts` |

### Refactoring checklist

1. Keep domain logic inside the module — don't leak auth logic into `core` or other modules.
2. Move API calls out of components into `services/` + `hooks/`.
3. Replace direct `fetch` / `axios` / React Query usage in components with the approved hooks.
4. Update imports to use path aliases (`@/auth/...`, not `@/modules/auth/...`).
5. Run `pnpm validate` before pushing — it runs lint, AGENTS.md checks, and a production build.

### Existing modules

| Module | Alias | Purpose |
|--------|-------|---------|
| `core` | `@/core/*` | Shared hooks, providers, shadcn/ui, utilities |
| `auth` | `@/auth/*` | Authentication feature (components, pages, etc.) |

---

## Scripts

```bash
pnpm dev           # Start dev server
pnpm build         # Production build
pnpm start         # Run production server
pnpm lint          # Biome check
pnpm format:fix    # Auto-fix lint + format
pnpm test          # AGENTS.md compliance (full repo)
pnpm test:staged   # AGENTS.md compliance (staged files only)
pnpm validate      # lint + test + build
```

---

## Git hooks

Run `pnpm prepare` once after clone to activate Husky.

| Hook | When | What runs |
|------|------|-------------|
| **pre-commit** | `git commit` | Biome on staged files + AGENTS.md checks on staged changes |
| **pre-push** | `git push` | Full lint + AGENTS.md checks + production build |

If a hook fails, fix the reported issues before retrying. Emergency bypass (not recommended): `git commit --no-verify` or `git push --no-verify`.

### Automated AGENTS.md checks

| Check | Rule |
|-------|------|
| Component structure | `components/Name/index.tsx` (except `core/components/ui/`) |
| PascalCase folders | Required (except `core/components/ui/`) |
| Arrow functions | Required in module components/pages (except `core/components/ui/`) |
| No module barrels | No root `index.ts` in module directories |
| Import aliases | Use `@/core/*`, `@/auth/*` — not `@/modules/*` |
| tsconfig aliases | Every module has a matching path alias |
| No API in components | No axios, fetch, or React Query in components |
| Server/client fetch | No `executeFetch` in `"use client"` files |

Full rules and examples: [`AGENTS.md`](./AGENTS.md)

---

## CI

GitHub Actions runs on push and pull requests:

- Biome lint + production build
- AGENTS.md structure compliance (`pnpm test`)

---

## Further reading

- [`AGENTS.md`](./AGENTS.md) — full architecture rules and conventions (required reading for contributors)
- [Next.js docs](https://nextjs.org/docs) — App Router, Server Components, caching
- [TanStack Query](https://tanstack.com/query) — client data fetching
- [shadcn/ui](https://ui.shadcn.com/) — UI primitives (add via CLI into `core/components/ui/`)
