import { LitElement, css, html } from 'lit';

export interface BreadcrumbItem {
  current?: boolean;
  href?: string;
  label: string;
}

export class Breadcrumb extends LitElement {
  static properties = {
    items: { type: Array },
  };

  declare items: Array<BreadcrumbItem>;

  constructor() {
    super();
    this.items = [];
  }

  static styles = css`
    :host {
      --breadcrumb-trail-current-color: var(--text-primary, var(--text-main, #111827));
      --breadcrumb-trail-focus-color: var(--accent-color, var(--accent, #2563eb));
      --breadcrumb-trail-secondary-color: var(--text-secondary, var(--text-muted, #6b7280));
      display: inline-block;
      min-width: 0;
    }

    nav,
    ol {
      display: flex;
      align-items: center;
      min-width: 0;
    }

    ol {
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      color: var(--breadcrumb-trail-secondary-color);
      font-size: 13px;
      white-space: nowrap;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    a:hover {
      color: var(--breadcrumb-trail-current-color);
      text-decoration: underline;
    }

    [aria-current='page'] {
      color: var(--breadcrumb-trail-current-color);
      font-weight: 600;
    }

    .separator {
      color: var(--breadcrumb-trail-secondary-color);
      user-select: none;
    }

    a:focus-visible {
      outline: 2px solid var(--breadcrumb-trail-focus-color);
      outline-offset: 3px;
      border-radius: 2px;
    }
  `;

  render() {
    return html`
      <nav aria-label="Breadcrumb">
        <ol>
          ${this.items.map((item, index) => html`
            <li>
              ${index > 0 ? html`<span class="separator" aria-hidden="true">&gt;</span>` : ''}
              ${item.current
                ? html`<span aria-current="page">${item.label}</span>`
                : html`<a href=${item.href ?? '#'}>${item.label}</a>`}
            </li>
          `)}
        </ol>
      </nav>
    `;
  }
}

if (!customElements.get('breadcrumb-trail')) {
  customElements.define('breadcrumb-trail', Breadcrumb);
}

declare global {
  interface HTMLElementTagNameMap {
    'breadcrumb-trail': Breadcrumb;
  }
}