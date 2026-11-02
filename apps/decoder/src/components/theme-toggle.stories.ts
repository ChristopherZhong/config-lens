import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './theme-toggle';

const meta: Meta = {
  title: 'Components/ThemeToggle',
  component: 'theme-toggle',
  argTypes: {
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark'],
      description: 'Current active theme',
    },
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    theme: 'dark',
  },
  render: (args) => html`
    <div
      style="padding: 2rem; background: var(--bg-main); border-radius: 0.5rem; display: inline-block;"
    >
      <theme-toggle .theme="${args.theme}"></theme-toggle>
    </div>
  `,
};
