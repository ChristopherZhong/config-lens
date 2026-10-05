import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './app-header';

const meta: Meta = {
  title: 'Components/AppHeader',
  component: 'app-header',
  tags: ['autodocs'],
  argTypes: {
    activeTab: { control: 'select', options: ['lint', 'compare'] },
    mode: { control: 'select', options: ['json', 'yaml'] },
    theme: { control: 'select', options: ['system', 'light', 'dark'] },
    formatFeedback: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj;

export const DefaultJsonLint: Story = {
  args: {
    activeTab: 'lint',
    mode: 'json',
    theme: 'system',
    formatFeedback: null,
  },
  render: (args) => html`
    <app-header
      .activeTab="${args.activeTab}"
      .mode="${args.mode}"
      .theme="${args.theme}"
      .formatFeedback="${args.formatFeedback}"
    ></app-header>
  `,
};

export const YamlCompareTab: Story = {
  args: {
    activeTab: 'compare',
    mode: 'yaml',
    theme: 'dark',
    formatFeedback: null,
  },
  render: (args) => html`
    <app-header
      .activeTab="${args.activeTab}"
      .mode="${args.mode}"
      .theme="${args.theme}"
      .formatFeedback="${args.formatFeedback}"
    ></app-header>
  `,
};

export const WithFormatSuccessMessage: Story = {
  args: {
    activeTab: 'lint',
    mode: 'json',
    theme: 'light',
    formatFeedback: { type: 'success', message: 'Formatted!' },
  },
  render: (args) => html`
    <app-header
      .activeTab="${args.activeTab}"
      .mode="${args.mode}"
      .theme="${args.theme}"
      .formatFeedback="${args.formatFeedback}"
    ></app-header>
  `,
};

export const WithFormatErrorMessage: Story = {
  args: {
    activeTab: 'lint',
    mode: 'json',
    theme: 'light',
    formatFeedback: { type: 'error', message: 'Invalid syntax' },
  },
  render: (args) => html`
    <app-header
      .activeTab="${args.activeTab}"
      .mode="${args.mode}"
      .theme="${args.theme}"
      .formatFeedback="${args.formatFeedback}"
    ></app-header>
  `,
};
