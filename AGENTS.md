<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 1) Module architecture (required)

Organize by feature/module, not by technical layer at root level.

### Standard module structure

```text
src/modules/
  <module-name>/
    components/
    hooks/
    pages/
    services/
    types/
    utils/
    index.ts
```

### Rules

1. Keep module-specific logic inside its own module folder.
2. `components/`: UI only (no API/network calls).
3. `services/`: API/network/business side effects.
4. `types/`: module-local TypeScript types/interfaces/schemas.
5. `hooks/`: module-specific hooks that orchestrate services and UI state.
6. `utils/`: pure helper functions (no side effects).
7. `pages/`: route-level composition for that module.
8. Export module public API from `src/modules/<module>/index.ts`.
9. Cross-module reusable code must be generic and go to `core` (or `src/shared` if your project uses it).

---

## 2) Core module contract (required)

Use `core` as the reusable foundation for feature modules.

### Core structure

```text
src/modules/
  core/
    components/
    hooks/
    services/
    types/
    utils/
    index.ts
```

### Core rules

1. `core` must contain only generic, cross-module logic.
2. Feature modules may compose/extend core primitives.
3. No domain-specific logic inside `core` (e.g., auth/order-only behavior).
4. Prefer composition over inheritance.
5. Export stable APIs from `src/modules/core/index.ts`.
6. Import core via public exports only, not internal file paths.
7. Preserve backward compatibility for core changes unless explicitly planned.

---

## 3) App Router data policy (required)

### Initial reads

1. Initial API fetch in App Router must be server-side using native `fetch()`.
2. Prefer Server Components/layout-level fetching for initial critical data.
3. Use caching controls intentionally (`cache`, `next: { revalidate, tags }`).

### Mutations

1. Form create/update/delete actions must use TanStack React Query `useMutation` in Client Components.
2. Mutation calls must go through module `services/`.
3. Invalidate/refetch relevant queries after mutation success.
4. Always handle loading/success/error states.

---

## 4) Forms, validation, and UI standards (required)

### Required libraries

1. Validation: `zod`
2. Form handling: `react-hook-form` + `@hookform/resolvers/zod`
3. UI library: `shadcn/ui`

### Rules

1. Define form schemas with Zod (`*.schema.ts` in module `types/` or `utils/`).
2. Use Zod-inferred form types (`z.infer<typeof Schema>`).
3. Map server validation errors back to fields with `setError` when applicable.
4. Use shadcn/ui primitives for form UI (avoid raw elements when equivalent exists).
5. Keep separation of concerns:
   - `components/`: rendering
   - `hooks/`: form/mutation orchestration
   - `services/`: API calls
   - `types/utils`: schema + parsing helpers

### Preferred pattern

```text
src/modules/<module>/types/<feature>.schema.ts
src/modules/<module>/components/<Feature>Form/index.tsx
src/modules/<module>/hooks/use<Feature>Form.ts
src/modules/<module>/services/<feature>.service.ts
```

---

## 5) Component file and declaration standards (required)

### Structure

1. Every component must be in its own folder.
2. Entry file must be `index.tsx`.

Example:

```text
src/modules/auth/components/UserCard/index.tsx
src/modules/core/components/Button/index.tsx
```

### Declaration rules

1. Components must use Arrow Functions.
2. Do not use `function ComponentName()` declarations for components.
3. Component and folder names must be PascalCase and match.

### Example

```tsx
const UserCard = () => {
  return <div>User Card</div>;
};

export default UserCard;
```

## 3) Data fetching and mutation policy (required)

Use only the approved data utilities below.

### Initial reads (Server-side)

1. In App Router, initial/critical page data must be fetched on the server.
2. Server-side fetching must use: `src/utils/execute-fetch.ts`
3. `execute-fetch.ts` is the standard wrapper over native `fetch()` and should be preferred over direct `fetch()` calls in app code.
4. Use caching controls intentionally (`cache`, `next: { revalidate, tags }`) via the wrapper options.

### Client reads (Client-side)

1. Client-side data fetching must use: `src/modules/core/hooks/useQueryFetch.ts`
2. Components should not call axios/fetch directly for query reads.
3. Query keys and caching behavior must follow React Query best practices and module boundaries.

### Mutations (Client-side)

1. All create/update/delete actions must use: `src/modules/core/hooks/useMutationQuery.ts`
2. Mutation calls must go through module `services/` (components remain UI-focused).
3. Invalidate/refetch relevant queries after mutation success.
4. Always handle loading/success/error states.

### Type flexibility standard

1. `execute-fetch.ts`, `useQueryFetch.ts`, and `useMutationQuery.ts` are flexible/typed utilities and should be consumed with module-specific types where available.
2. Keep these utilities generic and reusable; do not hardcode domain-specific response/request types in core utilities.
3. Prefer explicit typing at usage sites (`types/` in each module) to preserve safety and flexibility.
