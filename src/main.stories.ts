import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './main';

const meta: Meta = {
  title: 'App/ConfigLensApp',
  component: 'config-lens-app',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const DefaultLintView: Story = {
  render: () => html`
    <div style="height: 600px; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
      <config-lens-app></config-lens-app>
    </div>
  `,
};

export const CompareTabActive: Story = {
  render: () => {
    return html`
      <div style="height: 600px; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
        <config-lens-app
          .activeTab="${'compare'}"
        ></config-lens-app>
      </div>
    `;
  },
};

export const VersionNoticeBannerVisible: Story = {
  render: () => {
    return html`
      <div style="height: 650px; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
        <config-lens-app
          .newVersionAvailable="${true}"
          .latestVersion="${'2.0.0'}"
        ></config-lens-app>
      </div>
    `;
  },
};

export const ForcedDarkTheme: Story = {
  render: () => {
    return html`
      <div style="height: 600px; border: 1px solid #333; border-radius: 8px; overflow: hidden; background: #0a0a0a;">
        <config-lens-app
          .theme="${'dark'}"
        ></config-lens-app>
      </div>
    `;
  },
};
