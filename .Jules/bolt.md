## 2026-06-18 - In-flight Promise Deduplication for CodeMirror Linter Schema Validation
**Learning:** CodeMirror 6's `@codemirror/lint` plugin triggers validation functions (`validateContent`) on document change. When validating documents with remote `$schema` references, caching only resolved results in a `Map` still allows multiple concurrent `fetch` requests and `ajv.compile` executions during fast typing before the first promise resolves.
**Action:** Always cache active in-flight promises (`schemaPromiseCache` and `validatorPromiseCache`) alongside value caches when dealing with asynchronous validation or remote resource fetching triggered by editor input events.

## 2026-06-18 - Viewport-Restricted Syntax Tree Iteration for CodeMirror Annotations
**Learning:** CodeMirror 6 `ViewPlugin` instances that construct `Decoration.widget` based on syntax tree inspection (`syntaxTree(state).iterate`) execute full document AST traversals on every scroll (`update.viewportChanged`) or edit (`update.docChanged`) if ranges are omitted. Passing `view.visibleRanges` limits AST iteration to visible lines, preventing main-thread lag when viewing large documents.
**Action:** Always pass `view.visibleRanges` (or `update.view.visibleRanges`) to AST traversal helpers in CodeMirror decoration plugins to maintain O(viewport) execution time regardless of document size.
