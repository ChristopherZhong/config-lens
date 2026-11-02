import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './text-panel';

const meta: Meta = {
  title: 'Components/TextPanel',
  component: 'text-panel',
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    readonly: { control: 'boolean' },
    showPaste: { control: 'boolean' },
    showClear: { control: 'boolean' },
    showCopy: { control: 'boolean' },
    showSwap: { control: 'boolean' },
  },
};

export default meta;

export const InputPanel: StoryObj = {
  args: {
    title: 'Input',
    value: 'Hello, World! Type some text here.',
    placeholder: 'Type or paste your text to convert...',
    readonly: false,
    showPaste: true,
    showClear: true,
    showCopy: false,
    showSwap: false,
  },
  render: (args) => html`
    <div
      style="padding: 2rem; max-width: 600px; background: var(--bg-main); border-radius: 0.5rem;"
    >
      <text-panel
        .title="${args.title}"
        .value="${args.value}"
        .placeholder="${args.placeholder}"
        ?readonly="${args.readonly}"
        ?showPaste="${args.showPaste}"
        ?showClear="${args.showClear}"
        ?showCopy="${args.showCopy}"
        ?showSwap="${args.showSwap}"
      ></text-panel>
    </div>
  `,
};

export const OutputPanel: StoryObj = {
  args: {
    title: 'Output',
    value: 'SGVsbG8sIFdvcmxkISBUeXBlIHNvbWUgdGV4dCBoZXJlLg==',
    placeholder: 'Result will appear here...',
    readonly: true,
    showPaste: false,
    showClear: false,
    showCopy: true,
    showSwap: true,
  },
  render: (args) => html`
    <div
      style="padding: 2rem; max-width: 600px; background: var(--bg-main); border-radius: 0.5rem;"
    >
      <text-panel
        .title="${args.title}"
        .value="${args.value}"
        .placeholder="${args.placeholder}"
        ?readonly="${args.readonly}"
        ?showPaste="${args.showPaste}"
        ?showClear="${args.showClear}"
        ?showCopy="${args.showCopy}"
        ?showSwap="${args.showSwap}"
      ></text-panel>
    </div>
  `,
};
