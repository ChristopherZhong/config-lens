import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './main';

const meta: Meta = {
  title: 'App/ConfigLensApp',
  component: 'config-lens-app',
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
      description: 'Active document syntax mode',
    },
    theme: {
      control: 'select',
      options: ['system', 'light', 'dark'],
      description: 'Active theme mode',
    },
    newVersionAvailable: {
      control: 'boolean',
      description: 'Whether a new release version is available',
    },
    latestVersion: {
      control: 'text',
      description: 'Latest release version tag',
    },
  },
};

export default meta;
type Story = StoryObj;

const renderWithContainer = (args: any, height = '600px') => {
  const isDark = args.theme === 'dark';
  const background = isDark ? '#0a0a0a' : '#ffffff';
  const border = isDark ? '1px solid #333' : '1px solid #ccc';

  return html`
    <div style="height: ${height}; border: ${border}; border-radius: 8px; overflow: hidden; background: ${background};">
      <config-lens-app
        .activeTab="${args.activeTab}"
        .mode="${args.mode}"
        .theme="${args.theme}"
        .newVersionAvailable="${args.newVersionAvailable}"
        .latestVersion="${args.latestVersion}"
      ></config-lens-app>
    </div>
  `;
};

export const DefaultLintView: Story = {
  args: {
    activeTab: 'lint',
    mode: 'json',
    theme: 'system',
    newVersionAvailable: false,
    latestVersion: '1.0.0',
  },
  render: (args) => renderWithContainer(args),
};

export const CompareTabActive: Story = {
  args: {
    activeTab: 'compare',
    mode: 'json',
    theme: 'system',
    newVersionAvailable: false,
    latestVersion: '1.0.0',
  },
  render: (args) => renderWithContainer(args),
};

export const VersionNoticeBannerVisible: Story = {
  args: {
    activeTab: 'lint',
    mode: 'json',
    theme: 'system',
    newVersionAvailable: true,
    latestVersion: '2.0.0',
  },
  render: (args) => renderWithContainer(args, '650px'),
};
