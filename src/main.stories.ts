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

export const Default: Story = {
  render: () => html`
    <div style="height: 600px; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
      <config-lens-app></config-lens-app>
    </div>
  `,
};
