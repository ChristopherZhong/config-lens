# Developer Tools

This repository is an Nx monorepo for browser-based developer tools. Applications live under `apps/*`; reusable libraries belong under `packages/*`. The root page lists available tools, and GitHub Pages publishes each app under `/tools/<app>/` when this repository is named `tools`.

## Workspace

- [ConfigLens](apps/config-lens/README.md): JSON/YAML linting, formatting, schema validation, and comparison.
- [DevEncoder](apps/decoder/README.md): Client-side Base64, hexadecimal, URL, and ROT13 encoding and decoding.
- [OmniCalc](apps/calculator/README.md): A responsive calculator with scientific functions and calculation history.

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

Run a specific Nx project target with `npx nx run <project>:<target>`, for example `npx nx run decoder:test`. `npm run build` creates the deployable site in `dist/`, with the tools catalog at the root, ConfigLens under `config-lens/`, DevEncoder under `decoder/`, and OmniCalc under `calculator/`.
