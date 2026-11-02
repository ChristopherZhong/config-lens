# 🤖 Instructions for AI Agents

To maintain a healthy, up-to-date, and correct codebase across successive development sessions, all AI agents must strictly adhere to the following documentation maintenance rules:

## 1. Keep All Documentation Synced with Code Changes
Whenever you modify, add, remove, or reorganize elements of the codebase (such as files, folders, algorithms, components, utilities, configuration, or environment dependencies), you **must** immediately update any relevant documentation files (primarily `README.md` and any other user-facing markdown/text files):
- **Project Architecture:** Ensure any directory trees, architecture diagrams, or file-path references match the actual folder layout exactly.
- **Features & Algorithms:** Update tables, lists, or descriptions of supported features/algorithms to accurately represent the current capabilities of the application.
- **Local Setup & Dependency Notes:** If you modify `package.json` dependencies, node versions, or scripts, immediately update the corresponding instructions in the setup guides.

## 2. Ensure Environment & Remote Alignment
Before finalizing any work, inspect the active repository environment and ensure that the documentation points to correct endpoints:
- **Git Remotes:** Run `git remote -v` to determine the active repository owner and name.
- **Badges & Clone URLs:** Verify that all repository-specific links (such as GitHub Actions deployment badges, license badges, clone commands, or pull request links) match the active repository owner and name (e.g. `ChristopherZhong/decoder`).
- **Live Demo URLs:** Ensure deployment target links point to the correct GitHub Pages domain (e.g. `https://christopherzhong.github.io/decoder/`).

## 3. Review and Verify Before Submitting
- Always verify your documentation updates using read-only tools to confirm clarity, formatting, and correct syntax.
- Ensure that updating documentation does not introduce broken markdown links, stale descriptions, or typos.

## 4. State Management, Atomicity, and Refactoring Principles
To prevent over-engineering, code duplication, and logical "rabbit-holes," all agents must strictly adhere to the following principles when implementing state management, loading mechanisms, or refactoring:

### 1. State Atomicity over Partial Merges
- **The Principle:** Treat application state (e.g. `inputText`, `selectedAlgorithm`, `mode`) as a single, cohesive, atomic snapshot (e.g. an `AppState` interface with strictly non-optional fields).
- **The Rule:** Either a state source (such as URL parameter search string or `localStorage`) contains a fully-complete, fully-validated tuple of values, or we reject the entire source (`return null`) and fall back to the next complete source (or defaults).
- **The Goal:** Completely prevents "hybrid states" where some fields load from the URL, some load from `localStorage`, and some fallback to defaults. It eliminates complex coalescing (`??`) and conditional parsing loops.

### 2. Avoid "Local Optimization" Complexity Traps
- When feedback or bug reports identify a logical edge case (e.g. "hybrid/invalid states on reload"), **do not immediately patch the symptom by layering more conditional checks, optional interfaces, or helper functions.**
- **Instead:** Take a step back and examine the core data flow. Ask yourself: *"Is there a way to simplify the data contract itself so that this edge-case becomes impossible by design?"* Enforcing atomic parameters usually eliminates the need for complex, nested validation logic.

### 3. Maintain High DRYness without Convoluted Abstractions
- Keep helper utilities and loaders simple. If both URL parsing and storage parsing have similar structures, parameterize them with clean, straightforward functional inputs (like parameter-key lookups) rather than creating distinct, verbose duplicate helper functions.
