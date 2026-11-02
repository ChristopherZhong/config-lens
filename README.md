# Developer Tools

This repository is an Nx monorepo for browser-based developer tools. Applications live under `apps/*`; reusable libraries belong under `packages/*`. The root page lists available tools, and deployment publishes ConfigLens at `/tools/config-lens/` when this repository is named `tools` on GitHub Pages.

## Workspace

- [ConfigLens](apps/config-lens/README.md): JSON/YAML linting, formatting, schema validation, and comparison.

## Development

Requirements: Node.js `24.22.2` or later and npm `10` or later.

```bash
npm install
npm run dev
```

Run the workspace checks and production build:

```bash
npm run lint
npm test
npm run build
```

Run a specific Nx project target with `npx nx run config-lens:<target>`, for example `npx nx run config-lens:test:e2e`. `npm run build` creates the deployable site in `dist/`, with the tools catalog at the root and ConfigLens under `config-lens/`.
