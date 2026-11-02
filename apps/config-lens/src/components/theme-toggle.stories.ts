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

const renderWithContainer = (args: any) => {
  const isDark = args.theme === 'dark';
  const isLight = args.theme === 'light';
  const background = isDark ? '#121212' : isLight ? '#ffffff' : '#1e1e1e';

  return html`
    <div style="padding: 20px; background: ${background}; border-radius: 8px; display: inline-block;">
      <theme-toggle .theme="${args.theme}"></theme-toggle>
    </div>
  `;
};

export const Default: Story = {
  args: {
    theme: 'system',
  },
  render: (args) => renderWithContainer(args),
};
