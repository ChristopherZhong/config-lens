import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { EditorView, basicSetup } from 'codemirror';
import { json } from '@codemirror/lang-json';
import { foldAll, unfoldAll } from '@codemirror/language';
import { yaml } from '@codemirror/lang-yaml';
import { Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { MergeView } from '@codemirror/merge';
import { linter, lintGutter } from '@codemirror/lint';
import { validateContent } from '../utils/validation';
import { propertyAnnotationsPlugin, annotationTheme } from '../utils/annotations';
import { schemaHoverExtension } from '../utils/schema-hover';

@customElement('diff-component')
export class DiffComponent extends LitElement {
  @property({ type: String }) mode: 'json' | 'yaml' = 'json';
  @property({ type: String }) theme: 'light' | 'dark' = 'light';
  @property({ type: String }) original = '';
  @property({ type: String }) modified = '';
  @property({ type: Boolean, reflect: true }) compareExpanded = false;
  @query('#diff-container') container!: HTMLElement;

  private mergeView?: MergeView;
  private cleanupScrollSync?: () => void;

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.cleanupScrollSync) {
      this.cleanupScrollSync();
      this.cleanupScrollSync = undefined;
    }
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1 1 0%;
      min-height: 0;
      min-width: 0;
      max-width: 100%;
      height: 100%;
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }
    #diff-container {
      display: flex;
      flex-direction: column;
      flex: 1 1 0%;
      min-height: 0;
      min-width: 0;
      max-width: 100%;
      height: 100%;
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }
    .cm-mergeView {
        height: 100% !important;
        width: 100% !important;
        display: flex;
        flex-direction: column;
        flex: 1 1 0%;
        min-height: 0;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
    }
    .cm-mergeViewEditors {
        display: flex;
        flex-direction: row;
        flex: 1 1 0%;
        height: 100% !important;
        width: 100% !important;
        overflow: hidden;
        min-height: 0;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
    }
    .cm-mergeViewEditor {
        height: 100% !important;
        flex: 1 1 0%;
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        max-width: 100%;
        box-sizing: border-box;
    }
    .cm-mergeViewEditor .cm-editor {
        height: 100% !important;
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        flex: 1 1 0% !important;
        min-width: 0 !important;
        min-height: 0 !important;
    }
    /* Ensure gutters and other elements don't break layout */
    .cm-mergeViewSpacer {
        width: 2px;
        background: var(--border);
        flex-shrink: 0;
    }
    .cm-gutters {
        display: flex;
        flex-direction: row;
    }
    .cm-scroller {
        flex: 1 1 0% !important;
        min-height: 0 !important;
        min-width: 0 !important;
        overflow: auto !important;
        overscroll-behavior: contain;
    }
    .cm-line {
        white-space: pre-wrap !important;
    }

    /* Diff highlights */
    .cm-merge-a .cm-changedLine,
    .cm-deletedChunk {
        background-color: rgba(239, 68, 68, 0.15) !important;
    }
    .cm-merge-b .cm-changedLine,
    .cm-inlineChangedLine {
        background-color: rgba(34, 197, 94, 0.15) !important;
    }

    .cm-merge-a .cm-changedText,
    .cm-deletedText {
        background-color: rgba(239, 68, 68, 0.3) !important;
        text-decoration: line-through;
    }
    .cm-merge-b .cm-changedText {
        background-color: rgba(34, 197, 94, 0.3) !important;
    }

    /* Line-based highlights (fallback/explicit) */
    .cm-deletedLine {
        background-color: rgba(239, 68, 68, 0.15) !important;
        display: block;
    }
    .cm-insertedLine {
        background-color: rgba(34, 197, 94, 0.15) !important;
        display: block;
    }

    /* Pane headers */
    .diff-headers {
      display: flex;
      background: var(--bg-sidebar, #1e1e1e);
      border-bottom: 1px solid var(--border, #333);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted, #888);
      flex-shrink: 0;
    }
    .diff-pane-title {
      flex: 1;
      padding: 6px 16px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
    }

    .toggle-compare-btn {
      background: var(--bg-card, #252526);
      color: var(--text-muted, #888);
      border: 1px solid var(--border, #333);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
      line-height: 1;
      transition: background 0.15s ease, color 0.15s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toggle-compare-btn:hover {
      background: var(--border, #333);
      color: var(--text-main, #fff);
    }

    .toggle-compare-btn:focus-visible {
      outline: 2px solid var(--accent, #007acc);
      outline-offset: 1px;
    }

    .diff-pane-title:first-child {
      border-right: 1px solid var(--border, #333);
    }

    /* Transition animation for side-by-side compare panel */
    .cm-mergeViewSpacer,
    .cm-mergeViewEditor:nth-child(2) {
      transition: max-width 0.3s ease, flex 0.3s ease, opacity 0.3s ease;
    }

    :host(:not([compareexpanded])) .cm-mergeViewSpacer,
    :host(:not([compareexpanded])) .cm-mergeViewEditor:nth-child(2) {
      max-width: 0 !important;
      flex: 0 0 0% !important;
      opacity: 0 !important;
      pointer-events: none !important;
      overflow: hidden !important;
      border: none !important;
    }

    :host([compareexpanded]) .cm-mergeViewSpacer {
      width: 2px !important;
    }

    :host([compareexpanded]) .cm-mergeViewEditor:nth-child(2) {
      max-width: 50% !important;
      flex: 1 1 0% !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    .diff-pane-title.modified-title {
      transition: max-width 0.3s ease, flex 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
      overflow: hidden;
      white-space: nowrap;
      justify-content: flex-start;
    }

    :host(:not([compareexpanded])) .diff-pane-title.modified-title {
      max-width: 0 !important;
      flex: 0 0 0% !important;
      opacity: 0 !important;
      padding: 0 !important;
      pointer-events: none !important;
      border: none !important;
    }

    :host([compareexpanded]) .diff-pane-title.modified-title {
      max-width: 50% !important;
      flex: 1 1 0% !important;
      opacity: 1 !important;
      padding: 6px 16px !important;
    }

    /* Dark theme adjustments */
    :host([theme="dark"]) .cm-merge-a .cm-changedLine,
    :host([theme="dark"]) .cm-deletedChunk {
        background-color: rgba(248, 113, 113, 0.2) !important;
    }
    :host([theme="dark"]) .cm-merge-b .cm-changedLine,
    :host([theme="dark"]) .cm-inlineChangedLine {
        background-color: rgba(74, 222, 128, 0.2) !important;
    }
    :host([theme="dark"]) .cm-merge-a .cm-changedText,
    :host([theme="dark"]) .cm-deletedText {
        background-color: rgba(248, 113, 113, 0.4) !important;
    }
    :host([theme="dark"]) .cm-merge-b .cm-changedText {
        background-color: rgba(74, 222, 128, 0.4) !important;
    }
  `;

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('compareExpanded')) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 320);
    }

    if ((changedProperties.has('mode') || changedProperties.has('theme')) && this.mergeView) {
      this.initDiff();
      return;
    }

    if (changedProperties.has('original') && this.mergeView) {
        // Optimization: Fast O(1) length check skips doc.toString() rope allocations when content lengths differ,
        // and reuses doc.length directly when replacing view document content.
        const docALength = this.mergeView.a.state.doc.length;
        if (this.original.length !== docALength || this.original !== this.mergeView.a.state.doc.toString()) {
            this.mergeView.a.dispatch({
                changes: { from: 0, to: docALength, insert: this.original }
            });
        }
    }

    if (changedProperties.has('modified') && this.mergeView) {
        // Optimization: Fast O(1) length check skips doc.toString() rope allocations when content lengths differ,
        // and reuses doc.length directly when replacing view document content.
        const docBLength = this.mergeView.b.state.doc.length;
        if (this.modified.length !== docBLength || this.modified !== this.mergeView.b.state.doc.toString()) {
            this.mergeView.b.dispatch({
                changes: { from: 0, to: docBLength, insert: this.modified }
            });
        }
    }
  }

  firstUpdated() {
    this.initDiff();
  }

  private initDiff() {
    if (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }

    const extensions: Extension[] = [
      basicSetup,
      EditorView.lineWrapping,
      this.mode === 'json' ? json() : yaml(),
      propertyAnnotationsPlugin,
      annotationTheme,
      schemaHoverExtension(this.mode),
      lintGutter(),
      linter(async (view) => await validateContent(view.state.doc.toString(), this.mode)),
    ];

    if (this.theme === 'dark') {
      extensions.push(oneDark);
    }

    this.mergeView = new MergeView({
      a: {
        doc: this.original,
        extensions: [
            ...extensions,
            EditorView.editorAttributes.of({ 'aria-label': 'Original document content' }),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    const newContent = update.state.doc.toString();
                    if (newContent !== this.original) {
                        this.original = newContent;
                        this.dispatchEvent(new CustomEvent('original-changed', {
                            detail: { content: this.original }
                        }));
                    }
                }
            })
        ]
      },
      b: {
        doc: this.modified,
        extensions: [
            ...extensions,
            EditorView.editorAttributes.of({ 'aria-label': 'Modified document content' }),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    const newContent = update.state.doc.toString();
                    if (newContent !== this.modified) {
                        this.modified = newContent;
                        this.dispatchEvent(new CustomEvent('modified-changed', {
                            detail: { content: this.modified }
                        }));
                    }
                }
            })
        ]
      },
      parent: this.container,
      root: this.renderRoot as ShadowRoot
    });

    this.setupScrollSync();
  }

  foldAll() {
    if (this.mergeView) {
      foldAll(this.mergeView.a);
      foldAll(this.mergeView.b);
    }
  }

  unfoldAll() {
    if (this.mergeView) {
      unfoldAll(this.mergeView.a);
      unfoldAll(this.mergeView.b);
    }
  }

  private setupScrollSync() {
    if (this.cleanupScrollSync) {
      this.cleanupScrollSync();
      this.cleanupScrollSync = undefined;
    }

    if (!this.mergeView) return;

    const scrollerA = this.mergeView.a.scrollDOM;
    const scrollerB = this.mergeView.b.scrollDOM;

    if (!scrollerA || !scrollerB) return;

    let activeSource: 'A' | 'B' | null = null;
    let syncTimeout: ReturnType<typeof setTimeout> | null = null;

    const syncScroll = (source: 'A' | 'B') => {
      if (activeSource && activeSource !== source) return;
      activeSource = source;

      const from = source === 'A' ? scrollerA : scrollerB;
      const to = source === 'A' ? scrollerB : scrollerA;

      to.scrollTop = from.scrollTop;
      to.scrollLeft = from.scrollLeft;

      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        activeSource = null;
      }, 50);
    };

    const onScrollA = () => syncScroll('A');
    const onScrollB = () => syncScroll('B');

    scrollerA.addEventListener('scroll', onScrollA, { passive: true });
    scrollerB.addEventListener('scroll', onScrollB, { passive: true });

    this.cleanupScrollSync = () => {
      scrollerA.removeEventListener('scroll', onScrollA);
      scrollerB.removeEventListener('scroll', onScrollB);
      if (syncTimeout) clearTimeout(syncTimeout);
    };
  }

  private handleToggleCompare() {
    this.dispatchEvent(new CustomEvent('toggle-compare', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="diff-headers">
        <div class="diff-pane-title">
          <span>Original</span>
          ${!this.compareExpanded
            ? html`
                <button
                  type="button"
                  class="toggle-compare-btn"
                  @click="${this.handleToggleCompare}"
                  title="Expand compare panel"
                  aria-label="Expand compare panel"
                >&gt;&gt;</button>
              `
            : ''}
        </div>
        <div class="diff-pane-title modified-title">
          <button
            type="button"
            class="toggle-compare-btn"
            @click="${this.handleToggleCompare}"
            title="Collapse compare panel"
            aria-label="Collapse compare panel"
          >&lt;&lt;</button>
          <span>Modified</span>
        </div>
      </div>
      <div id="diff-container"></div>
    `;
  }
}
