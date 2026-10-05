import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './components/editor-component';
import './components/diff-component';
import './components/theme-toggle';
import './components/version-notice-banner';
import './components/editor-toolbar';
import './components/app-header';
import './components/app-footer';
import type { EditorComponent } from './components/editor-component';
import type { DiffComponent } from './components/diff-component';
import { checkLatestRelease } from './utils/version-check';
import { safeStorageGetItem, safeStorageSetItem } from './utils/storage';
import { documentFormatterRegistry } from './utils/document-formatter-registry';
import './utils/strategies/json-formatter-strategy';
import './utils/strategies/yaml-formatter-strategy';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';
const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

const DEFAULT_JSON = JSON.stringify({
  "$schema": "https://www.schemastore.org/package.json",
  "name": "config-lens",
  "version": "1.0.0",
  "description": "Modern JSON/YAML Config Tools",
  "scripts": {
    "test": "echo \"no test specified\""
  }
}, null, 2);

@customElement('config-lens-app')
export class ConfigLensApp extends LitElement {
  @state() private activeTab: 'lint' | 'compare' = 'lint';
  @state() private mode: 'json' | 'yaml' = 'json';
  @state() private theme: 'light' | 'dark' | 'system' = 'system';
  @state() private content = DEFAULT_JSON;
  @state() private modifiedContent = DEFAULT_JSON;

  @state() private newVersionAvailable = false;
  @state() private latestVersion: string | null = null;
  @state() private noticeDismissed = false;
  @state() private formatFeedback: { type: 'success' | 'error'; message: string } | null = null;

  private versionCheckTimer?: number;
  private formatFeedbackTimer?: number;
  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.checkForUpdate();
    }
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-width: 100vw;
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
      background: var(--bg-main);
      color: var(--text-main);
    }

    main {
      flex: 1 1 0%;
      display: flex;
      overflow: hidden;
      padding: 20px;
      gap: 20px;
      min-height: 0;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
      width: 100%;
    }

    .editor-wrapper {
      flex: 1 1 0%;
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      min-height: 0;
      min-width: 0;
      max-width: 100%;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
    }

    editor-component,
    diff-component {
      flex: 1 1 0%;
      min-height: 0;
      min-width: 0;
      max-width: 100%;
      height: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  `;

  connectedCallback() {
    super.connectedCallback();

    const savedContent = safeStorageGetItem('config-lens-content');
    if (savedContent) {
        this.content = savedContent;
        this.modifiedContent = savedContent;
    }
    const savedMode = safeStorageGetItem('config-lens-mode');
    if (savedMode) this.mode = savedMode as 'json' | 'yaml';

    const savedTheme = safeStorageGetItem('config-lens-theme');
    if (savedTheme) {
        this.theme = savedTheme as 'light' | 'dark' | 'system';
    }

    // Listen for system theme changes
    if (typeof window.matchMedia === 'function') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          if (this.theme === 'system') {
              this.applyTheme();
              this.requestUpdate();
          }
      });
    }

    this.applyTheme();

    // Check for updates
    this.checkForUpdate();
    this.versionCheckTimer = window.setInterval(() => this.checkForUpdate(), CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.versionCheckTimer) {
      clearInterval(this.versionCheckTimer);
    }
    if (this.formatFeedbackTimer) {
      clearTimeout(this.formatFeedbackTimer);
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private async checkForUpdate() {
    const result = await checkLatestRelease(APP_VERSION);
    if (result.newVersionAvailable) {
      this.newVersionAvailable = true;
      this.latestVersion = result.latestVersion;
    }
  }

  private handleRefresh() {
    window.location.reload();
  }

  private handleDismissNotice() {
    this.noticeDismissed = true;
  }

  private getResolvedTheme(): 'light' | 'dark' {
    if (this.theme === 'system') {
        return (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    return this.theme;
  }

  private applyTheme() {
    document.documentElement.setAttribute('data-theme', this.getResolvedTheme());
  }

  private setTheme(theme: 'light' | 'dark' | 'system') {
    this.theme = theme;
    safeStorageSetItem('config-lens-theme', this.theme);
    this.applyTheme();
  }

  private handleContentChange(e: CustomEvent) {
    this.content = e.detail.content;
    safeStorageSetItem('config-lens-content', this.content);
  }

  private handleOriginalChange(e: CustomEvent) {
      this.content = e.detail.content;
      safeStorageSetItem('config-lens-content', this.content);
  }

  private handleModifiedChange(e: CustomEvent) {
      this.modifiedContent = e.detail.content;
  }

  private handleModeChange(e: CustomEvent) {
    this.mode = e.detail.mode;
    safeStorageSetItem('config-lens-mode', this.mode);
  }

  private handleTabChange(e: CustomEvent) {
    this.activeTab = e.detail.tab;
  }

  private handleThemeChange(e: CustomEvent) {
    this.setTheme(e.detail.theme);
  }

  private showFormatFeedback(type: 'success' | 'error', message: string) {
    if (this.formatFeedbackTimer) {
      clearTimeout(this.formatFeedbackTimer);
    }
    this.formatFeedback = { type, message };
    this.formatFeedbackTimer = window.setTimeout(() => {
      this.formatFeedback = null;
    }, 2000);
  }

  private formatContent() {
    try {
        this.content = documentFormatterRegistry.format(this.mode, this.content);
        safeStorageSetItem('config-lens-content', this.content);
        this.showFormatFeedback('success', 'Formatted!');
    } catch (e) {
        console.error('Cannot format invalid content');
        this.showFormatFeedback('error', 'Invalid syntax');
    }
  }

  private handleFoldAll() {
    if (this.activeTab === 'lint') {
      const editor = this.shadowRoot?.querySelector<EditorComponent>('editor-component');
      editor?.foldAll();
    } else {
      const diff = this.shadowRoot?.querySelector<DiffComponent>('diff-component');
      diff?.foldAll();
    }
  }

  private handleUnfoldAll() {
    if (this.activeTab === 'lint') {
      const editor = this.shadowRoot?.querySelector<EditorComponent>('editor-component');
      editor?.unfoldAll();
    } else {
      const diff = this.shadowRoot?.querySelector<DiffComponent>('diff-component');
      diff?.unfoldAll();
    }
  }

  render() {
    const resolvedTheme = this.getResolvedTheme();

    return html`
      <app-header
        .activeTab="${this.activeTab}"
        .mode="${this.mode}"
        .theme="${this.theme}"
        .formatFeedback="${this.formatFeedback}"
        @tab-change="${this.handleTabChange}"
        @mode-change="${this.handleModeChange}"
        @theme-change="${this.handleThemeChange}"
        @format-click="${this.formatContent}"
      ></app-header>

      ${this.newVersionAvailable && !this.noticeDismissed ? html`
        <version-notice-banner
          .latestVersion="${this.latestVersion}"
          @refresh-click="${this.handleRefresh}"
          @dismiss-click="${this.handleDismissNotice}"
        ></version-notice-banner>
      ` : ''}

      <main>
        ${this.activeTab === 'lint' ? html`
          <div
            id="panel-lint"
            class="editor-wrapper"
            role="tabpanel"
            aria-labelledby="tab-lint"
          >
            <editor-toolbar
              title="Editor"
              @fold-all="${this.handleFoldAll}"
              @unfold-all="${this.handleUnfoldAll}"
            ></editor-toolbar>
            <editor-component
                .mode="${this.mode}"
                .theme="${resolvedTheme}"
                .content="${this.content}"
                @content-changed="${this.handleContentChange}"
            ></editor-component>
          </div>
        ` : html`
          <div
            id="panel-compare"
            class="editor-wrapper"
            role="tabpanel"
            aria-labelledby="tab-compare"
          >
            <editor-toolbar
              title="Compare (Original vs Modified)"
              @fold-all="${this.handleFoldAll}"
              @unfold-all="${this.handleUnfoldAll}"
            ></editor-toolbar>
            <diff-component
                .mode="${this.mode}"
                .theme="${resolvedTheme}"
                .original="${this.content}"
                .modified="${this.modifiedContent}"
                @original-changed="${this.handleOriginalChange}"
                @modified-changed="${this.handleModifiedChange}"
            ></diff-component>
          </div>
        `}
      </main>

      <app-footer
        status="Ready"
        encoding="UTF-8"
        .version="${APP_VERSION}"
      ></app-footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'config-lens-app': ConfigLensApp;
  }
}
