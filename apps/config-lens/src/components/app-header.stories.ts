import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './app-header';

const meta: Meta = {
  title: 'Components/AppHeader',
  component: 'app-header',
  tags: ['autodocs'],
  argTypes: {
    activeTab: {
      control: 'select',
      options: ['lint', 'compare'],
      description: 'Active tab view mode',
    },
    mode: {
      control: 'select',
      options: ['json', 'yaml'],
      description: 'Active language syntax mode',
    },
    theme: {
      control: 'select',
      options: ['system', 'light', 'dark'],
      description: 'Active visual theme mode',
    },
    formatFeedback: {
      control: 'object',
      description: 'Status message feedback for document formatting actions',
    },
  },
};

export default meta;
type Story = StoryObj;

const renderWithContainer = (args: any) => {
  const isDark = args.theme === 'dark';
  const background = isDark ? '#121212' : '#f8f9fa';

  return html`
    <div style="padding: 16px; background: ${background}; border-radius: 8px;">
      <app-header
        .activeTab="${args.activeTab}"
        .mode="${args.mode}"
        .theme="${args.theme}"
        .formatFeedback="${args.formatFeedback}"
      ></app-header>
    </div>
  `;
};

export const DefaultJsonLint: Story = {
  args: {
    activeTab: 'lint',
    mode: 'json',
    theme: 'system',
    formatFeedback: null,
  },
  render: (args) => renderWithContainer(args),
};

export const YamlCompareTab: Story = {
  args: {
    activeTab: 'compare',
    mode: 'yaml',
    theme: 'system',
    formatFeedback: null,
  },
  render: (args) => renderWithContainer(args),
};

export const WithFormatSuccessMessage: Story = {
  args: {
    activeTab: 'lint',
    mode: 'json',
    theme: 'system',
    formatFeedback: { type: 'success', message: 'Formatted!' },
  },
  render: (args) => renderWithContainer(args),
};

export const WithFormatErrorMessage: Story = {
  args: {
    activeTab: 'lint',
    mode: 'json',
    theme: 'system',
    formatFeedback: { type: 'error', message: 'Invalid syntax' },
  },
  render: (args) => renderWithContainer(args),
};
