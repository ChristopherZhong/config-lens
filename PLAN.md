# Project Plan & Development Roadmap - JSON/YAML Linter & Diff Tool

This project provides a modern, fast, static web-based linter, schema validator, and side-by-side comparison tool for JSON and YAML files.

---

## 🚀 Features Status

- [x] **Real-Time Linting**: In-editor syntax validation for JSON and YAML.
- [x] **Schema Validation**: Dynamic JSON Schema fetching and AJV validation via `$schema`.
- [x] **Comparison Tool**: Side-by-side diff with synchronized scrolling and diff highlighting.
- [x] **Auto-Formatting**: One-click beautification for JSON and YAML documents.
- [x] **Persistence**: LocalStorage support for content, selected language mode, and theme.
- [x] **Modern UI & Theming**: Segmented 3-state theme control (System Default, Light, Dark).
- [x] **Accessibility**: ARIA labels, semantic tab/radio controls, and focus styles.
- [x] **Static Deployment**: Automated GitHub Pages workflow via GitHub Actions.
- [x] **Comprehensive Testing**: Vitest unit tests and Playwright E2E tests.
- [x] **Enhanced Documentation**: Mermaid diagrams, canonical repository metadata, and AI agent guidelines.

---

## 🛠️ Tech Stack Overview

- **Framework**: Lit 3 (Lightweight Web Components)
- **Language**: TypeScript 6
- **Bundler**: Vite 8
- **Editor**: CodeMirror 6 (`@codemirror/view`, `@codemirror/lint`, `@codemirror/merge`)
- **Parsers & Validators**: AJV 8 & js-yaml 4
- **Testing**: Vitest 4 & Playwright 1
- **Styling**: Vanilla CSS with CSS Custom Properties
- **Deployment**: GitHub Actions (`.github/workflows/deploy.yml`)

---

## 📌 Implementation Phases

### Phase 1: Project Setup & Architecture
- [x] Create `PLAN.md` and `AGENTS.md`.
- [x] Bootstrap Vite + Lit + TypeScript codebase.
- [x] Configure GitHub Actions deployment workflow (`deploy.yml`).

### Phase 2: Core Logic & Parsers
- [x] Integrate CodeMirror 6 editor engine.
- [x] Implement JSON (`JSON.parse`) and YAML (`js-yaml`) validation logic.
- [x] Implement schema detection, fetching, and AJV compilation (`src/utils/validation.ts`).

### Phase 3: UI Shell & Editor Views
- [x] Build application shell (`<linter-app>` in `src/main.ts`).
- [x] Build `<editor-component>` with CodeMirror 6 linting extensions.
- [x] Implement formatting and LocalStorage persistence.

### Phase 4: Side-by-Side Diffing View
- [x] Implement `<diff-component>` using CodeMirror 6 `MergeView`.
- [x] Ensure bidirectional editing and synchronized state handling.

### Phase 5: Test Suite & Accessibility
- [x] Configure Vitest unit testing infrastructure.
- [x] Configure Playwright E2E testing framework.
- [x] Refine accessibility (ARIA roles, keyboard focus, high contrast styling).

### Phase 6: Documentation & Single Source of Truth
- [x] Update `README.md` with complete usage instructions, feature lists, and technical stack details.
- [x] Embed single source of truth for GitHub Description and Repository Topic Tags in `README.md`.
- [x] Add Mermaid diagrams for system architecture and client-side data flow.
- [x] Synchronize `AGENTS.md` and `PLAN.md` to ensure developer and AI alignment.

---

## 🔮 Future Enhancements Roadmap

- [ ] Export diff output as patch/unified diff format.
- [ ] Support custom user-uploaded JSON/YAML schema files.
- [ ] Add CSV and TOML conversion/linting support.
