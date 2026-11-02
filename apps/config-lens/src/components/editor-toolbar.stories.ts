import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './editor-toolbar';

const meta: Meta = {
  title: 'Components/EditorToolbar',
  component: 'editor-toolbar',
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Section heading title',
    },
  },
};

export default meta;
type Story = StoryObj;

export const EditorMode: Story = {
  args: {
    title: 'Editor',
  },
  render: (args) => html`
    <div style="border: 1px solid var(--border, #333); border-radius: 8px; overflow: hidden;">
      <editor-toolbar .title="${args.title}"></editor-toolbar>
    </div>
  `,
};

export const CompareMode: Story = {
  args: {
    title: 'Compare (Original vs Modified)',
  },
  render: (args) => html`
    <div style="border: 1px solid var(--border, #333); border-radius: 8px; overflow: hidden;">
      <editor-toolbar .title="${args.title}"></editor-toolbar>
    </div>
  `,
};
