import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './theme-toggle';

const meta: Meta = {
  title: 'Components/ThemeToggle',
  component: 'theme-toggle',
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['system', 'light', 'dark'],
      description: 'Active theme mode selection',
    },
  },
};

export default meta;
type Story = StoryObj;

export const SystemTheme: Story = {
  args: {
    theme: 'system',
  },
  render: (args) => html`
    <div style="padding: 20px; background: var(--bg-sidebar, #1e1e1e);">
      <theme-toggle .theme="${args.theme}"></theme-toggle>
    </div>
  `,
};

export const LightTheme: Story = {
  args: {
    theme: 'light',
  },
  render: (args) => html`
    <div style="padding: 20px; background: #ffffff;">
      <theme-toggle .theme="${args.theme}"></theme-toggle>
    </div>
  `,
};

export const DarkTheme: Story = {
  args: {
    theme: 'dark',
  },
  render: (args) => html`
    <div style="padding: 20px; background: #121212;">
      <theme-toggle .theme="${args.theme}"></theme-toggle>
    </div>
  `,
};
