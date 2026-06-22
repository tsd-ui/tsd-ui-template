# Tooling Alignment Plan: trustify-ui -> tsd-ui-template

## Context

The `trustify-ui` repo uses alternative tooling (Biome, Rsbuild, Jest) compared to the `tsd-ui-template` standard (ESLint+Prettier, Vite, Vitest). This plan aligns trustify-ui's tooling incrementally, ordered easiest-to-hardest, so each phase is a standalone, testable milestone.

**Target repo:** `/home/cferiavi/git/tsd/tsd-ui-template`
**Source repo:** `/home/cferiavi/git/trustification/trustify-ui`

---

## Phase 1: Add Node Engine Constraint

**Difficulty:** Trivial | **Risk:** None

Add `engines` field to root `package.json`:
```json
"engines": { "node": ">=22", "npm": ">=10" }
```

**Files:** `package.json`
**Verify:** `npm install` completes without engine warnings

---

## Phase 2: Biome -> ESLint + Prettier

**Difficulty:** Moderate | **Risk:** Medium (large formatting diff)

### 2a. Install ESLint + Prettier deps at root

Add to root `devDependencies`:
- `eslint` ^9.39.2, `@eslint/js` ^9.39.2, `typescript-eslint` ^8.35.0
- `eslint-config-prettier` ^10.1.5, `eslint-plugin-prettier` ^5.5.1
- `eslint-plugin-react` ^7.37.5, `eslint-plugin-react-hooks` ^7.0.1, `eslint-plugin-react-refresh` ^0.5.0
- `prettier` ^3.7.4, `globals` ^17.0.0

Remove from root `devDependencies`:
- `@biomejs/biome`

Delete `biome.json` from repo root.

### 2b. Create `eslint.config.mjs`

Based on template's `eslint.config.mjs`. Adapt:
- `parserOptions.project`: `["./common/tsconfig.json", "./client/tsconfig.json", "./e2e/tsconfig.json"]`
- `ignores`: add `client/src/app/client/**` (generated OpenAPI code)
- `settings.react.version`: `"19"`

### 2c. Convert biome-ignore comments (24 in client/src + 35 in e2e)

**client/src (24 comments):**

| Biome rule | ESLint equivalent | Count |
|---|---|---|
| `lint/suspicious/noExplicitAny` | `@typescript-eslint/no-explicit-any` | 14 |
| `lint/correctness/useExhaustiveDependencies` | `react-hooks/exhaustive-deps` | 4 |
| `lint/suspicious/noArrayIndexKey` | `react/no-array-index-key` | 2 |
| `lint/style/noNonNullAssertion` | `@typescript-eslint/no-non-null-assertion` | 1 |
| `lint/correctness/useHookAtTopLevel` | `react-hooks/rules-of-hooks` | 1 |
| `lint/complexity/noBannedTypes` | `@typescript-eslint/no-restricted-types` | 1 |

**e2e (35 comments):**

| Biome rule | ESLint equivalent | Count |
|---|---|---|
| `lint/suspicious/noExplicitAny` | `@typescript-eslint/no-explicit-any` | 24 |
| `lint/style/noNonNullAssertion` | `@typescript-eslint/no-non-null-assertion` | 5 |
| `lint/correctness/noUnusedFunctionParameters` | `@typescript-eslint/no-unused-vars` | 1 |
| `lint/correctness/noUnusedPrivateClassMembers` | `@typescript-eslint/no-unused-vars` (or remove) | 1 |
| `lint/suspicious/noConfusingVoidType` | `@typescript-eslint/no-invalid-void-type` | 1 |

Each `// biome-ignore lint/...` -> `// eslint-disable-next-line <rule>`

### 2d. Update scripts (root + client + common + server)

- Rename `check` -> `lint`, `check:write` -> `lint:fix`
- Change `format`/`format:fix` commands from biome to prettier
- Update e2e scripts too (replace biome commands with eslint/prettier)

### 2e. Run initial formatting pass

`npm run format:fix` as a standalone commit (large diff, formatting-only).

### 2f. Update CI

In `.github/workflows/ci-repo.yaml`: `npm run check` -> `npm run lint`

**Files:** `package.json`, `eslint.config.mjs` (new), `biome.json` (delete), `client/package.json`, `common/package.json`, `server/package.json`, `e2e/package.json`, 24 client + 35 e2e source files with biome-ignore, `.github/workflows/ci-repo.yaml`
**Verify:** `npm run lint` + `npm run format` + `npm run build` + `npm test` all pass

---

## Phase 3: Rsbuild -> Vite

**Difficulty:** High | **Risk:** High

### 3a. Install Vite deps in client

Add to `client/devDependencies`:
- `vite` ^8.0.0, `@vitejs/plugin-react` ^5.1.4
- `vite-plugin-ejs` ^1.7.0, `vite-plugin-static-copy` ^3.2.0
- `vite-plugin-istanbul` (for e2e Istanbul coverage instrumentation)

Remove from `client/devDependencies`:
- `@rsbuild/core`, `@rsbuild/plugin-react`, `@rsbuild/plugin-type-check`
- `raw-loader`, `swc-plugin-coverage-instrument`

### 3b. Create `client/vite.config.ts`

Based on template's `client/vite.config.ts`. Key adaptations:
- **Proxies:** 3 routes (from rsbuild.config.ts):
  - `/auth` -> `OIDC_SERVER_URL` (default localhost:8090)
  - `/api` -> `TRUSTIFY_API_URL` (default localhost:8080)
  - `/.well-known/trustify` -> `TRUSTIFY_API_URL`
- **Plugins:** Replicate `ignoreProcessEnv` (transform hook) and `copy-index` (EJS rename) from rsbuild config
- **Static copy:** favicon.ico, manifest.json, branding assets
- **Path alias:** `@app` -> `./src/app`, `@mocks` -> `./src/mocks`
- **Chunk splitting:** manual chunks for react/react-dom

### 3c. Update `client/index.html`

Add `<script type="module" src="/src/index.tsx"></script>` before `</body>` (Vite requires explicit entry point, unlike Rsbuild which auto-injects).

### 3d. Configure vite-plugin-istanbul for e2e coverage

Add `vite-plugin-istanbul` to Vite plugins (conditional on dev mode). This replaces `swc-plugin-coverage-instrument` — the e2e fixtures read `window.__coverage__` and write to `.nyc_output/`, which remains unchanged.

### 3e. Update type references

`client/src/env.d.ts`: `/// <reference types="@rsbuild/core/types" />` -> `/// <reference types="vite/client" />`

### 3f. Update client scripts

```
"build": "npm run generate && tsc --noEmit && vite build"
"start:dev": "npm run generate && vite --port 3000 --host"
```

### 3g. Delete `client/rsbuild.config.ts`

**Files:** `client/package.json`, `client/vite.config.ts` (new), `client/rsbuild.config.ts` (delete), `client/index.html`, `client/src/env.d.ts`
**Verify:** `npm run build -w client` + `npm run start:dev` (proxy routes work, OIDC auth works) + Docker build

---

## Phase 4: Jest -> Vitest

**Difficulty:** Moderate-High | **Risk:** Medium | **Requires:** Phase 3

### 4a. Install Vitest deps

Add: `vitest` ^4.0.0 and `jsdom` ^28 to client devDeps, `@vitest/coverage-v8` ^4.0.0 to root devDeps
Remove: `jest`, `ts-jest`, `@types/jest`, `jest-environment-jsdom`, `ts-node` (if unused elsewhere)

### 4b. Add Vitest config to `vite.config.ts`

Add `test` block with jsdom environment, globals: true, setupFiles, v8 coverage, and `@patternfly/react-styles` + `@trustify-ui/common` as inline deps.

### 4c. Create `client/test-setup.ts`

Based on template's file. Replace current `client/setupTests.ts`.

### 4d. Convert 6 test files (Jest -> Vitest API)

All occurrences of:
- `jest.mock()` -> `vi.mock()`
- `jest.fn()` -> `vi.fn()`
- `jest.MockedFunction<T>` -> `MockedFunction<T>` (import from vitest)
- `jest.requireActual()` -> `vi.importActual()` (async)
- `jest.clearAllMocks()` -> `vi.clearAllMocks()`

Test files (6 total):
- `client/src/app/hooks/domain-controls/useDownload.test.ts` — heaviest: 8 mocks, requireActual, clearAllMocks
- `client/src/app/layout/default-layout.test.tsx` — 6 mocks, requireActual
- `client/src/app/axios-config/apiInit.test.ts` — 5 mocks
- `client/src/app/components/ReadOnlyContext.test.tsx` — 1 mock, MockedFunction
- `client/src/app/pages/vulnerability-list/components/CvssVersionBadge.test.tsx` — needs inspection
- `client/src/app/utils/utils.test.ts` — no Jest-specific APIs, works as-is

### 4e. Cleanup

Delete `client/config/jest.config.ts` and `client/setupTests.ts`. Remove Jest mock files (`fileMock.ts`, `styleMock.ts`) if unused.

### 4f. Update scripts + CI

`"test": "vitest"`, `"coverage": "vitest run --coverage"`
CI: remove `--watchAll=false` flag, use `vitest run`

**Files:** `client/vite.config.ts`, `client/test-setup.ts` (new), `client/config/jest.config.ts` (delete), `client/setupTests.ts` (delete), 6 test files, `client/package.json`, `package.json`, `.github/workflows/ci-repo.yaml`
**Verify:** `npm test -w client` passes all 6 test files + `npm run coverage -w client` generates report

---

## Phase 5: TypeScript 5.7 -> 6.0

**Difficulty:** High | **Risk:** High | **Requires:** Phases 2-4 complete

### 5a. Update version

Root `package.json`: `"typescript": "^6.0.0"`

### 5b. Split client tsconfig (align with template)

- `client/tsconfig.json` -> project references file
- `client/tsconfig.app.json` -> app source (target ES2022, module ESNext, jsx react-jsx)
- `client/tsconfig.node.json` -> vite/test config (target ES2023)

### 5c. Fix breaking changes

**Enums (3 found, will break with `erasableSyntaxOnly`):**
- `client/src/app/Routes.tsx:49` — `export enum PathParam`
- `client/src/app/components/FilterToolbar/FilterToolbar.tsx:18` — `export enum FilterType`
- `client/src/app/Constants.ts:40` — `export enum TableURLParamKeyPrefix`

Convert each to `const` object + type union:
```ts
export const FilterType = { ... } as const;
export type FilterType = (typeof FilterType)[keyof typeof FilterType];
```

### 5d. Update ESLint config

Point `parserOptions.project` at new split tsconfig files.

**Files:** `package.json`, `client/tsconfig.json`, `client/tsconfig.app.json` (new), `client/tsconfig.node.json` (new), `common/tsconfig.json`, 3 files with enums, `eslint.config.mjs`
**Verify:** `npx tsc --noEmit` + `npm run build` + `npm test` + `npm run lint` all pass

---

## Summary

| Phase | What | Difficulty | Est. Effort | Depends On |
|-------|------|-----------|-------------|------------|
| 1 | Node engines | Trivial | 5 min | — |
| 2 | Biome -> ESLint+Prettier | Moderate | 1-2 days | — |
| 3 | Rsbuild -> Vite | High | 2-3 days | — |
| 4 | Jest -> Vitest | Moderate-High | 1 day | Phase 3 |
| 5 | TypeScript 5 -> 6 | High | 1-2 days | Phases 2-4 |
