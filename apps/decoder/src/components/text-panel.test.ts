import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './text-panel';
import { TextPanel } from './text-panel';

describe('TextPanel Component', () => {
  let element: TextPanel;

  beforeEach(() => {
    element = document.createElement('text-panel') as TextPanel;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should render title and value', async () => {
    element.title = 'Test Input';
    element.value = 'Hello';
    await element.updateComplete;

    const titleSpan = element.shadowRoot?.querySelector('.panel-title');
    expect(titleSpan?.textContent).toBe('Test Input');

    const textarea = element.shadowRoot?.querySelector('textarea');
    expect(textarea?.value).toBe('Hello');
  });

  it('should trigger text-changed event on textarea input', async () => {
    let triggeredValue = '';
    element.addEventListener('text-changed', (e: Event) => {
      triggeredValue = (e as CustomEvent).detail.value;
    });

    await element.updateComplete;
    const textarea = element.shadowRoot?.querySelector('textarea');
    if (textarea) {
      textarea.value = 'New Value';
      textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    }

    expect(triggeredValue).toBe('New Value');
  });
});
