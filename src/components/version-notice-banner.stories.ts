import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './version-notice-banner';

const meta: Meta = {
  title: 'Components/VersionNoticeBanner',
  component: 'version-notice-banner',
  tags: ['autodocs'],
  argTypes: {
    latestVersion: { control: 'text', description: 'Latest detected application release version' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    latestVersion: '2.1.0',
  },
  render: (args) => html`
    <version-notice-banner .latestVersion="${args.latestVersion}"></version-notice-banner>
  `,
};

export const WithoutVersionNumber: Story = {
  args: {
    latestVersion: null,
  },
  render: (args) => html`
    <version-notice-banner .latestVersion="${args.latestVersion}"></version-notice-banner>
  `,
};
