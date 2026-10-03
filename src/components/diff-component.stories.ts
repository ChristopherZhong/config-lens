import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './diff-component';

const meta: Meta = {
  title: 'Components/DiffComponent',
  component: 'diff-component',
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['json', 'yaml'] },
    theme: { control: 'select', options: ['light', 'dark'] },
    original: { control: 'text' },
    modified: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

const originalJson = JSON.stringify(
  {
    name: "config-lens",
    version: "1.0.0",
    status: "active"
  },
  null,
  2
);

const modifiedJson = JSON.stringify(
  {
    name: "config-lens",
    version: "1.1.0",
    status: "active",
    newFeature: true
  },
  null,
  2
);

export const Default: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    original: originalJson,
    modified: modifiedJson,
  },
  render: (args) => html`
    <div style="height: 400px; border: 1px solid #ccc; border-radius: 8px;">
      <diff-component
        .mode="${args.mode}"
        .theme="${args.theme}"
        .original="${args.original}"
        .modified="${args.modified}"
      ></diff-component>
    </div>
  `,
};

export const DarkTheme: Story = {
  args: {
    mode: 'json',
    theme: 'dark',
    original: originalJson,
    modified: modifiedJson,
  },
  render: (args) => html`
    <div style="height: 400px; border: 1px solid #333; border-radius: 8px; background: #0a0a0a;">
      <diff-component
        .mode="${args.mode}"
        .theme="${args.theme}"
        .original="${args.original}"
        .modified="${args.modified}"
      ></diff-component>
    </div>
  `,
};
