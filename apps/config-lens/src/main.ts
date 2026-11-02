import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './components/editor-component';
import './components/diff-component';
import './components/theme-toggle';
import './components/version-notice-banner';
import './components/editor-toolbar';
import './components/app-header';
import './components/app-footer';
import type { DiffComponent } from './components/diff-component';
import { checkLatestRelease } from './utils/version-check';
import { safeStorageGetItem, safeStorageSetItem } from './utils/storage';
import { documentFormatterRegistry } from './utils/document-formatter-registry';
import './utils/strategies/json-formatter-strategy';
import './utils/strategies/yaml-formatter-strategy';
import { DEFAULT_JSON, DEFAULT_YAML } from './constants/samples';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';
const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

@customElement('config-lens-app')
export class ConfigLensApp extends LitElement {
  @state() private compareExpanded = false;
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
      gap: 0px;
      min-height: 0;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
      width: 100%;
    }

    main.has-compare {
      gap: 20px;
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

    .compare-panel {
      flex: 1 1 0%;
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      min-height: 0;
      min-width: 0;
      height: 100%;
      box-sizing: border-box;
      max-width: 0;
      opacity: 0;
      border-width: 0;
      transition: flex 0.3s ease, max-width 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
      pointer-events: none;
    }

    .compare-panel.expanded {
      max-width: 100%;
      opacity: 1;
      border-width: 1px;
      pointer-events: auto;
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

    const savedMode = safeStorageGetItem('config-lens-mode');
    if (savedMode === 'json' || savedMode === 'yaml') {
      this.mode = savedMode;
    }

    const defaultContent = this.mode === 'json' ? DEFAULT_JSON : DEFAULT_YAML;

    const savedContent = safeStorageGetItem(`config-lens-content-${this.mode}`);
    this.content = savedContent !== null ? savedContent : defaultContent;

    const savedModified = safeStorageGetItem(`config-lens-modified-${this.mode}`);
    this.modifiedContent = savedModified !== null ? savedModified : defaultContent;

    const savedCompare = safeStorageGetItem('config-lens-compare-expanded');
    if (savedCompare !== null) {
      this.compareExpanded = savedCompare === 'true';
    }

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
      return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
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

  private handleOriginalChange(e: CustomEvent) {
    this.content = e.detail.content;
    safeStorageSetItem(`config-lens-content-${this.mode}`, this.content);
  }

  private handleModifiedChange(e: CustomEvent) {
    this.modifiedContent = e.detail.content;
    safeStorageSetItem(`config-lens-modified-${this.mode}`, this.modifiedContent);
  }

  private handleModeChange(e: CustomEvent) {
    const newMode = e.detail.mode as 'json' | 'yaml';
    if (this.mode === newMode) return;

    // Save current content before switching
    safeStorageSetItem(`config-lens-content-${this.mode}`, this.content);
    safeStorageSetItem(`config-lens-modified-${this.mode}`, this.modifiedContent);

    this.mode = newMode;
    safeStorageSetItem('config-lens-mode', this.mode);

    const defaultContent = this.mode === 'json' ? DEFAULT_JSON : DEFAULT_YAML;
    const savedContent = safeStorageGetItem(`config-lens-content-${this.mode}`);
    this.content = savedContent !== null ? savedContent : defaultContent;

    const savedModified = safeStorageGetItem(`config-lens-modified-${this.mode}`);
    this.modifiedContent = savedModified !== null ? savedModified : defaultContent;
  }

  private toggleComparePanel() {
    this.compareExpanded = !this.compareExpanded;
    safeStorageSetItem('config-lens-compare-expanded', String(this.compareExpanded));
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
      safeStorageSetItem(`config-lens-content-${this.mode}`, this.content);
      this.showFormatFeedback('success', 'Formatted!');
    } catch (e) {
      console.error('Cannot format invalid content', e);
      this.showFormatFeedback('error', 'Invalid syntax');
    }
  }

  private handleFoldAll() {
    const diff = this.shadowRoot?.querySelector<DiffComponent>('diff-component');
    diff?.foldAll();
  }

  private handleUnfoldAll() {
    const diff = this.shadowRoot?.querySelector<DiffComponent>('diff-component');
    diff?.unfoldAll();
  }

  private handleCopyContent() {
    const textToCopy = this.content;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch((err) => {
        console.error('Failed to copy text: ', err);
      });
    }
  }

  private handleClearContent() {
    this.content = '';
    safeStorageSetItem(`config-lens-content-${this.mode}`, '');
  }

  render() {
    const resolvedTheme = this.getResolvedTheme();

    return html`
      <app-header
        .mode="${this.mode}"
        .theme="${this.theme}"
        .formatFeedback="${this.formatFeedback}"
        ?isEmpty="${!this.content || !this.content.trim()}"
        @mode-change="${this.handleModeChange}"
        @theme-change="${this.handleThemeChange}"
        @format-click="${this.formatContent}"
      ></app-header>

      ${this.newVersionAvailable && !this.noticeDismissed
        ? html`
            <version-notice-banner
              .latestVersion="${this.latestVersion}"
              @refresh-click="${this.handleRefresh}"
              @dismiss-click="${this.handleDismissNotice}"
            ></version-notice-banner>
          `
        : ''}

      <main>
        <div class="editor-wrapper">
          <editor-toolbar
            title="${this.compareExpanded ? 'Compare (Original vs Modified)' : 'Editor'}"
            ?showCompareToggle="${false}"
            ?isEmpty="${!this.content || !this.content.trim()}"
            @fold-all="${this.handleFoldAll}"
            @unfold-all="${this.handleUnfoldAll}"
            @copy-content="${this.handleCopyContent}"
            @clear-content="${this.handleClearContent}"
          ></editor-toolbar>
          <diff-component
            .mode="${this.mode}"
            .theme="${resolvedTheme}"
            .original="${this.content}"
            .modified="${this.modifiedContent}"
            .compareExpanded="${this.compareExpanded}"
            @original-changed="${this.handleOriginalChange}"
            @modified-changed="${this.handleModifiedChange}"
            @toggle-compare="${this.toggleComparePanel}"
          ></diff-component>
        </div>
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
