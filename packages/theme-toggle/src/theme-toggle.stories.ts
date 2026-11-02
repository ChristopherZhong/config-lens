import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { Theme } from './theme-toggle';
import './index';

type ThemeToggleStoryArgs = {
  theme: Theme;
};

const meta: Meta<ThemeToggleStoryArgs> = {
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

type Story = StoryObj<ThemeToggleStoryArgs>;

export const Default: Story = {
  args: {
    theme: 'system',
  },
  render: ({ theme }) => html`
    <div style="padding: 20px; background: #1e1e1e; border-radius: 8px; display: inline-block;">
      <theme-toggle .theme="${theme}"></theme-toggle>
    </div>
  `,
};