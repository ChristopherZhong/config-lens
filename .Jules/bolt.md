## 2026-06-18 - In-flight Promise Deduplication for CodeMirror Linter Schema Validation
**Learning:** CodeMirror 6's `@codemirror/lint` plugin triggers validation functions (`validateContent`) on document change. When validating documents with remote `$schema` references, caching only resolved results in a `Map` still allows multiple concurrent `fetch` requests and `ajv.compile` executions during fast typing before the first promise resolves.
**Action:** Always cache active in-flight promises (`schemaPromiseCache` and `validatorPromiseCache`) alongside value caches when dealing with asynchronous validation or remote resource fetching triggered by editor input events.

## 2026-06-18 - Viewport-Restricted Syntax Tree Iteration for CodeMirror Annotations
**Learning:** CodeMirror 6 `ViewPlugin` instances that construct `Decoration.widget` based on syntax tree inspection (`syntaxTree(state).iterate`) execute full document AST traversals on every scroll (`update.viewportChanged`) or edit (`update.docChanged`) if ranges are omitted. Passing `view.visibleRanges` limits AST iteration to visible lines, preventing main-thread lag when viewing large documents.
**Action:** Always pass `view.visibleRanges` (or `update.view.visibleRanges`) to AST traversal helpers in CodeMirror decoration plugins to maintain O(viewport) execution time regardless of document size.

## 2026-06-18 - Direct Parser Invocation for Standalone AST Traversals
**Learning:** When resolving document AST syntax nodes outside an active CodeMirror `EditorView` (e.g., mapping schema validation errors to character ranges in `findPositionForPath`), creating a full `EditorState` via `EditorState.create({ doc, extensions })` allocates redundant state facets and extension configurations. Using `language.parser.parse(documentText)` directly constructs the Lezer `Tree` faster without state creation overhead.
**Action:** Prefer calling `jsonLanguage.parser.parse(...)` or `yamlLanguage.parser.parse(...)` directly when only an AST `Tree` is needed outside `EditorView` context.

## 2026-06-18 - Fast Fast-Path Regex Schema Extraction & Direct State Slicing
**Learning:** Calling full JSON/YAML document parsers (`JSON.parse` / `jsYaml.load`) or converting entire CodeMirror document ropes (`view.state.doc.toString()`) inside high-frequency event handlers like CodeMirror's `hoverTooltip` causes severe UI thread blocking (~5ms-30ms per hover check).
**Action:** Use fast regex string matching (~0.001ms) as a fast-path before falling back to full object parsers, and slice specific AST node text directly from `view.state.sliceDoc(from, to)` to prevent heap allocations on hover.

## 2026-06-18 - Pre-parsed AST Reuse for Batch Diagnostic Position Mapping
**Learning:** During schema linting (`validateContent`), mapping multiple AJV validation errors to document character positions via `findPositionForPath` caused redundant full Lezer syntax tree parses (`parser.parse(documentText)`) for every error diagnostic.
**Action:** Pre-parse the Lezer syntax tree once before batch position lookups and pass the pre-parsed `Tree` into mapping functions to avoid O(N) AST re-parsing overhead.

## 2026-06-18 - Fast Substring Pre-check for Schema URL Extraction
**Learning:** High-frequency CodeMirror extensions like `hoverTooltip` call `extractSchemaUrl` on every mouse hover. Without a fast substring guard (`!documentText.includes('$schema')`), documents without schema directives still trigger full Lezer syntax tree parsing and fallback `JSON.parse` or `jsYaml.load` executions, causing UI micro-jank on hover.
**Action:** Always perform an O(1) substring check for required schema markers (`$schema` / `schema`) before triggering document AST parsing or deserialization.

## 2026-06-18 - Immutable Document WeakMap Caching for High-Frequency Hover Handlers
**Learning:** In CodeMirror 6, `view.state.doc` is an immutable `Text` instance that remains identical across non-editing user interactions like mouse movements. High-frequency extensions like `hoverTooltip` previously executed `view.state.doc.toString()` and re-extracted `$schema` URLs on every hover over document properties. Caching extracted metadata in a `WeakMap<Text, Map<mode, url>>` eliminates redundant string allocations and parsing runs during continuous hovering, automatically invalidating when document edits produce a new `Text` instance.
**Action:** Use a `WeakMap` keyed on CodeMirror's immutable `Text` (`view.state.doc`) to cache expensive document-level extractions across high-frequency view interactions like hover tooltips or line decorations.
