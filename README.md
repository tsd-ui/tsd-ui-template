# TSD-UI-TEMPLATE

This repository should serve as a guideline for all the other repositories our team own.

## Tooling

- **Package manager**: NPM
- **Build Tool**: Vite
- **Core UI**: ReactJS
- **Server State Management**: TanStack Query
- **Linting**: Eslint
- **Formatting**: Prettier
- **Testing**: Vitest

## Environment Variables

| Variable          | Default                   | Description                                                                                                                      |
|-------------------|---------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `BASE_URL`        |                           | Base URL path for Vite and branding asset resolution                                                                             |
| `TEMPLATE_ENGINE` |                           | Set to `"on"` to skip EJS resolution at build time and instead rename `index.html` to `index.html.ejs` for server-side rendering |
| `NODE_ENV`        | `"production"`            | Application mode: `"development"`, `"production"`, or `"test"`                                                                   |
| `PORT`            | `8080`                    | Server listening port                                                                                                            |
| `API_URL`         | `"http://localhost:8080"` | Target URL for the UI server's `/api` proxy. **Required** in container mode                                                      |
| `VERSION`         | `"99.0.0"`                | Application version                                                                                                              |
| `BRANDING`        | `"./branding"`            | Path to branding assets relative to the project root                                                                             |
