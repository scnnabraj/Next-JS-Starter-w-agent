<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project overview

Next.js 16 App Router starter organized by **feature modules**. Shared infrastructure lives in `core`; domain logic lives in feature modules under `src/modules/`.

### Current layout

```text
src/
├── app/                          # Next.js routes (layout.tsx, page.tsx, route segments)
│   ├── layout.tsx                # Root layout — wraps app in React Query provider
│   ├── page.tsx
│   └── globals.css
├── modules/
│   └── core/                     # Generic, cross-module utilities only
│       ├── hooks/
│       │   ├── useQueryFetch.ts  # Client-side reads (React Query + axios)
│       │   └── useMutationQuery.ts
│       ├── providers/
│       │   └── RTKQueryProvider.tsx  # TanStack QueryClientProvider (legacy name)
│       └── utils/
│           └── slugify.ts
├── utils/                        # App-level utilities (not module-specific)
│   ├── execute-fetch.ts          # Server-side fetch wrapper (auth via cookies)
│   └── axios.ts                  # globalAxios + authAxios (client-side HTTP)
└── constants/
    └── index.ts                  # Env-based config (API_BASE_URL, auth keys)
```

### Tooling

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager (`pnpm-lock.yaml`) |
| **Biome** | Lint + format (`pnpm lint`, `pnpm format:fix`) |
| **Husky + lint-staged** | Pre-commit checks on staged files |
| **Tailwind CSS v4** | Styling via `globals.css` + utility classes |
| **TanStack React Query v5** | Client-side data cache and mutations |
| **TypeScript** | Strict mode; path aliases configured in `tsconfig.json` |

### Path aliases (`tsconfig.json`)

Each module gets a dedicated alias in `compilerOptions.paths`. Import via the module alias, not the full `src/modules/` path.

**Currently configured:**

```json
"paths": {
  "@/*": ["./src/*"],
  "@/core/*": ["./src/modules/core/*"]
}
```

| Alias | Resolves to | Example import |
|-------|-------------|----------------|
| `@/*` | `src/*` | `@/utils/execute-fetch`, `@/constants` |
| `@/core/*` | `src/modules/core/*` | `@/core/hooks/useQueryFetch` |

**When adding a new module**, register its alias in `tsconfig.json` before importing from it:

```json
"paths": {
  "@/*": ["./src/*"],
  "@/core/*": ["./src/modules/core/*"],
  "@/auth/*": ["./src/modules/auth/*"]
}
```

Then import using the short alias:

```tsx
import LoginPage from "@/auth/pages/LoginPage";
import { useQueryFetch } from "@/core/hooks/useQueryFetch";
```

Do not add a root `index.ts` barrel — the alias points at the module folder; import directly from the source file.

### Environment variables

Create `.env.local` at the project root:

```bash
NEXT_PUBLIC_API_URL=https://your-api.example.com
NEXT_PUBLIC_AUTH_TOKEN_KEY=auth_token
NEXT_PUBLIC_AUTH_ROLE=role
```

These are read from `src/constants/index.ts` and used by `executeFetch`, `axios`, and auth interceptors.

### Commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Start dev server (http://localhost:3000)
pnpm build      # Production build
pnpm start      # Run production server
pnpm lint       # Biome check
pnpm format:fix # Auto-fix lint + format
```

---

## 1) Module architecture (required)

Organize by **feature/module**, not by technical layer at the `src/` root.

### Standard module structure

```text
src/modules/
  <module-name>/
    components/
    hooks/
    pages/          # Route-level composition (imported by src/app routes)
    services/
    types/
    utils/
```

Do **not** add a root `index.ts` barrel file in module directories. Import directly from the source file using the module's path alias (e.g. `@/core/...`, `@/auth/...`).

### Layer responsibilities

| Folder | Responsibility |
|--------|----------------|
| `components/` | UI only — no API/network calls |
| `services/` | API calls and business side effects |
| `types/` | Module-local types, interfaces, Zod schemas |
| `hooks/` | Orchestrate services + UI/form state |
| `utils/` | Pure helpers (no side effects) |
| `pages/` | Compose module UI for a route; consumed by `src/app/<route>/page.tsx` |

### Rules

1. Keep all module-specific logic inside its own module folder.
2. Register a path alias in `tsconfig.json` when creating a new module (see **Path aliases** above).
3. Import directly from the source file via the module alias — e.g. `@/auth/components/LoginForm`, not a module barrel.
4. Cross-module imports are allowed via module aliases; keep them limited to what is genuinely shared.
5. Generic, reusable logic belongs in `core` — never domain-specific behavior (e.g. auth-only rules in core).

### Import convention

```tsx
// Good — direct import via module alias
import LoginForm from "@/auth/components/LoginForm";
import { useLoginForm } from "@/auth/hooks/useLoginForm";
import { useQueryFetch } from "@/core/hooks/useQueryFetch";

// Avoid — module root barrel re-exports
import { LoginForm } from "@/auth";
import { useQueryFetch } from "@/core";

// Avoid — full path when a module alias exists
import LoginForm from "@/modules/auth/components/LoginForm";
```

### Routing: `src/app/` vs module `pages/`

- **`src/app/`** — Next.js App Router files (`layout.tsx`, `page.tsx`, `loading.tsx`, etc.). These define URLs.
- **`src/modules/<module>/pages/`** — Module-owned page composition. App routes should stay thin and delegate here.

```tsx
// src/app/dashboard/page.tsx
import DashboardPage from "@/dashboard/pages/DashboardPage";

export default function Page() {
  return <DashboardPage />;
}
```

App Router route files (`layout.tsx`, `page.tsx`) may use `export default function` — that is a Next.js convention and is allowed.

---

## 2) Core module contract (required)

`core` is the shared foundation. Feature modules compose core primitives; they do not duplicate them.

### Core structure

```text
src/modules/core/
  components/
  hooks/          # useQueryFetch, useMutationQuery
  providers/      # RTKQueryProvider (React Query)
  services/
  types/
  utils/          # slugify, etc.
```

### Core rules

1. `core` contains only generic, cross-module logic.
2. No domain-specific logic (e.g. order checkout, user login flows).
3. Prefer composition over inheritance.
4. Import core utilities via the `@/core/*` alias — e.g. `@/core/hooks/useQueryFetch`.
5. Do not add a root `index.ts` barrel in `core` or any other module.
6. Preserve backward compatibility for core changes unless explicitly planned.

### Currently in core

- `useQueryFetch` — client reads via React Query + axios
- `useMutationQuery` — client mutations via React Query + axios
- `RTKQueryProvider` — wraps the app with `QueryClientProvider` (registered in `src/app/layout.tsx`)
- `slugify` — string slug helper

Module `services/` should use `authAxios` / `globalAxios` from `@/utils/axios` for HTTP calls consumed by the core hooks.

---

## 3) Data fetching and mutations (required)

Use only the approved utilities below. Do not call `fetch()`, `axios`, or React Query hooks directly in components.

### Server reads (initial / critical data)

Use `executeFetch` from `@/utils/execute-fetch` in **Server Components** or server actions.

- Wraps native `fetch()` against `API_BASE_URL`
- Attaches `Authorization: Bearer <token>` from cookies automatically
- Pass `cache` / `next: { revalidate, tags }` via the `init` argument

```tsx
import { executeFetch } from "@/utils/execute-fetch";

const Page = async () => {
  const res = await executeFetch("/users/me", {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  const user = await res.json();
  return <div>{user.name}</div>;
};
```

Prefer layout- or page-level fetching for data needed on first render.

### Client reads

Use `useQueryFetch` from `@/core/hooks/useQueryFetch` in **Client Components** (`"use client"`).

- Uses React Query + `authAxios` (default) or `globalAxios` (`auth: false`)
- Components must not call axios/fetch directly for query reads
- Provide explicit `queryKeys` for cache identity

```tsx
"use client";
import { useQueryFetch } from "@/core/hooks/useQueryFetch";

const { data, isLoading, error } = useQueryFetch<User>({
  url: "/users/me",
  queryKeys: ["users", "me"],
});
```

### Mutations (create / update / delete)

Use `useMutationQuery` from `@/core/hooks/useMutationQuery` in **Client Components**.

- HTTP calls belong in module `services/`; hooks orchestrate the mutation
- Pass `queryKeys` in the mutation payload to invalidate related queries on success
- Always handle loading, success, and error states in the UI

```tsx
"use client";
import { useMutationQuery } from "@/core/hooks/useMutationQuery";

const mutation = useMutationQuery();

mutation.mutate({
  url: "/users",
  method: "post",
  data: payload,
  queryKeys: ["users"],
  onSuccess: () => { /* ... */ },
});
```

### HTTP clients (`src/utils/axios.ts`)

| Instance | Use when |
|----------|----------|
| `authAxios` | Authenticated requests (default for core hooks) |
| `globalAxios` | Public/unauthenticated endpoints |

Both use `API_BASE_URL`. `authAxios` attaches the token from cookies (server) or `js-cookie-helper` (client) and redirects to `/` on 401.

### Type flexibility

- `executeFetch`, `useQueryFetch`, and `useMutationQuery` are generic utilities.
- Do not hardcode domain types inside core — type at the usage site via module `types/`.
- Module `services/` define request/response shapes; hooks and components consume them.

---

## 4) Forms, validation, and UI (required when building forms)

### Target stack

Install before building your first form:

1. **Validation:** `zod`
2. **Form handling:** `react-hook-form` + `@hookform/resolvers/zod`
3. **UI:** `shadcn/ui` (Tailwind-based primitives)

Until installed, use plain HTML forms only for scaffolding — do not add alternative form libraries.

### Form file pattern

```text
src/modules/<module>/types/<feature>.schema.ts
src/modules/<module>/components/<Feature>Form/index.tsx
src/modules/<module>/hooks/use<Feature>Form.ts
src/modules/<module>/services/<feature>.service.ts
```

### Form rules

1. Define schemas with Zod in `types/*.schema.ts`; infer types with `z.infer<typeof Schema>`.
2. Form hooks call module `services/` and `useMutationQuery` — components stay UI-only.
3. Map server validation errors to fields with `setError` when applicable.
4. Use shadcn/ui primitives for form UI once installed.

---

## 5) Component standards (required)

### Structure

1. Every component lives in its own folder.
2. Entry file is always `index.tsx` inside the component folder (not a module root barrel).
3. Component and folder names match in PascalCase.

```text
src/modules/auth/components/UserCard/index.tsx
src/modules/core/components/Button/index.tsx
```

### Declaration

1. Use arrow functions for components.
2. Do not use `function ComponentName()` for module components.
3. **Exception:** App Router files in `src/app/` (`layout.tsx`, `page.tsx`, etc.) may use `export default function` per Next.js convention.

```tsx
const UserCard = () => {
  return <div>User Card</div>;
};

export default UserCard;
```

### Styling

- Use Tailwind utility classes.
- Global styles live in `src/app/globals.css`.
- Use `next/image` for images — do not use raw `<img>` (enforced by Biome).

---

## 6) Adding a new feature module (checklist)

1. Create `src/modules/<name>/` with the standard folder structure.
2. Add a path alias in `tsconfig.json`:

   ```json
   "@/<name>/*": ["./src/modules/<name>/*"]
   ```

3. Add types in `types/`, API calls in `services/`.
4. Add hooks that wire services to `useQueryFetch` / `useMutationQuery`.
5. Build UI in `components/` (one folder per component, each with its own `index.tsx`).
6. Add route composition in `pages/` if needed.
7. Create a thin route in `src/app/<route>/page.tsx` that imports via the module alias.
8. Run `pnpm lint` before committing.

### Example: `auth` module

```text
src/modules/auth/
  components/
    LoginForm/
      index.tsx
  hooks/
    useLoginForm.ts
  services/
    auth.service.ts
  types/
    login.schema.ts
  pages/
    LoginPage/
      index.tsx
```

```json
// tsconfig.json — add when creating the auth module
"@/auth/*": ["./src/modules/auth/*"]
```

```tsx
// src/app/login/page.tsx
import LoginPage from "@/auth/pages/LoginPage";

export default function Page() {
  return <LoginPage />;
}
```
