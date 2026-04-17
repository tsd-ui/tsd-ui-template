# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TSD Console UI Template — a monorepo React 19 web console with optional SSR, built on PatternFly 6 and Express 5. Three npm workspaces: `common/` (shared types, branding, environment), `client/` (React SPA via Vite), `server/` (Express backend via Rollup).

## Commands

```bash
# Development
npm run start:dev          # Run common + client in parallel (Vite dev server on port 3000)
npm run start:dev:client   # Client dev server only
npm run start:dev:common   # Build & watch common package only

# Build
npm run build              # Build all workspaces (common → client → server)
npm run clean              # Remove dist directories
npm run dist               # Create distribution directory with compiled artifacts

# Production
npm run start              # Build all + start Express server (port 8080)

# Quality
npm run lint               # ESLint across all workspaces
npm run lint:fix           # Auto-fix lint errors
npm run format             # Check Prettier formatting
npm run format:fix         # Auto-format

# Testing
npm test                   # Run tests in all workspaces
npm run test -w client     # Client tests only
npm run coverage -w client # Coverage report (v8 provider)
```

## Architecture

**Monorepo structure with npm workspaces:**
- `common/` — Dual-output (ESM + CJS) package exporting environment types, branding strings, and shared interfaces. Built with Rollup. Branding strings are injected via a Rollup virtual plugin from `branding/strings.json`.
- `client/` — React 19 SPA built with Vite. Uses `@tanstack/react-query` for server state, PatternFly 6 for UI components, and `tsd-ui` for theming (`ThemeProvider`, `ThemeSelector`). Path alias: `@app/*` → `./src/app/*`.
- `server/` — Express 5 backend built with Rollup. Serves static client assets, proxies `/api` routes to `API_URL`, and optionally renders EJS templates when `TEMPLATE_ENGINE=on`.
- `branding/` — Logos, favicon, PWA manifest, and localizable strings (EJS template format).

**Data flow:** Environment variables are defined in `common/src/environment.ts`, base64-encoded via EJS, and decoded client-side in `client/src/app/env.ts` from `window._env`.

**Key environment variables:** `API_URL` (proxy target), `PORT` (server port, default 8080), `TEMPLATE_ENGINE` (set "on" for SSR), `BRANDING` (branding assets path), `BASE_URL` (Vite base path).

## Code Style

- Double quotes (Prettier `singleQuote: false`), semicolons required, 2-space indent
- ESLint flat config with TypeScript strict + stylistic checks, React hooks/refresh plugins
- Unused variables must be prefixed with `_`
- `React.FC<Props>` for typed components; functional components only
- Barrel exports via `index.ts` files for layout, components
- PascalCase for components/types, camelCase with `use` prefix for hooks, UPPER_SNAKE_CASE for constants

## Testing

Vitest with jsdom environment. Setup file at `client/test-setup.ts` adds `@testing-library/jest-dom` matchers and `window.matchMedia` polyfill.

## CI

Two GitHub Actions workflows:
- `ci.yaml` — install → build → lint → format check (Node 22)
- `ci-image-build.yaml` — multi-arch Docker build test (amd64 + arm64) on PRs with build file changes
