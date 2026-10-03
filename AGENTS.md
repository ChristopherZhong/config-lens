# AI Agent Guidelines & Coding Standards

This document establishes development rules and technical guidelines for AI agents working on the `Linter.ai` codebase.

---

## 🎯 Core Principles

1. **Strict TypeScript Typing**: All code must be strictly typed (`noImplicitAny`, strict null checks). Do not use `any` unless absolutely necessary (e.g. dynamic JSON parser output) and properly narrowed.
2. **Web Components with Lit**: Build UI elements using [Lit](https://lit.dev/). Do not introduce heavy frontend frameworks like React, Vue, or Angular.
3. **Vanilla CSS & Design Tokens**: Do not use CSS frameworks (Tailwind, Bootstrap, etc.). Use vanilla CSS with custom properties (`var(--bg-main)`, `var(--text-main)`, `var(--border)`) defined in `index.html` for theming.
4. **CodeMirror 6 Editor Standard**: Use CodeMirror 6 for all code editing and diffing interfaces.
   - When instantiating `EditorView` or `MergeView` inside Shadow DOM, explicitly set `root: this.renderRoot` to ensure proper cursor positioning and selection handling.
   - Re-initialize or update CodeMirror views cleanly when themes or languages change.
5. **State Persistence**: Persist user inputs, selected language mode (`json` | `yaml`), and theme preference (`light` | `dark` | `system`) in browser `localStorage`.
6. **Accessibility & Micro-UX**:
   - Interactive elements must use semantic markup (`<button>`, `<select>`).
   - Icon-only controls require explicit `aria-label` and visible `:focus-visible` outlines.
   - Theme toggle controls must use standard `role="radiogroup"` and `role="radio"` attributes.
7. **Package Manager & Environment**: Always use `npm` for dependency management and script execution. Target Node.js LTS (`>=24`).
8. **Proactive Testing**:
   - Write unit tests using `Vitest` for validation/parsing functions (`src/utils/validation.ts`).
   - Write E2E tests using `Playwright` for UI interactions and layout integrity.
9. **Documentation Integrity**: Keep `README.md`, `PLAN.md`, and `AGENTS.md` updated as features evolve or project rules change.
10. **Interview Flow Requirement**: When entering deep planning mode to clarify user expectations, agents MUST follow an interview flow, asking questions one at a time to ensure absolute clarity on requirements before forming the final plan.

---

## 📂 Project Architecture Quick Reference

```
linter/
├── .github/
│   └── workflows/deploy.yml   # GitHub Pages automated deployment
├── src/
│   ├── components/
│   │   ├── editor-component.ts # Single code editor with real-time diagnostics
│   │   └── diff-component.ts   # Side-by-side diff view with MergeView
│   ├── utils/
│   │   └── validation.ts       # Syntax parsing, AJV Schema validation & caching
│   └── main.ts                 # Main linter-app Lit shell component
├── tests/                      # Vitest unit tests & Playwright E2E tests
├── index.html                  # Main entry point & CSS custom properties
├── AGENTS.md                   # AI Agent guidance (this file)
├── PLAN.md                     # Roadmap and implementation progress
└── README.md                   # Canonical repository documentation & metadata
```

---

## 🛠️ Verification & Quality Check Commands

Before committing or submitting changes, always execute:

```bash
# 1. Typecheck and Production Build
npm run build

# 2. Run Unit Tests
npm run test

# 3. Run E2E Tests
npm run test:e2e
```
