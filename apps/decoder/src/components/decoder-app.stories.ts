import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './decoder-app';

const meta: Meta = {
  title: 'Applications/DecoderApp',
  component: 'decoder-app',
};

export default meta;

export const AppDashboard: StoryObj = {
  render: () => html` <decoder-app></decoder-app> `,
};
