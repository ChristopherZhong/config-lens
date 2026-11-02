import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './algorithm-selector';

const meta: Meta = {
  title: 'Components/AlgorithmSelector',
  component: 'algorithm-selector',
  argTypes: {
    selectedAlgorithm: {
      control: { type: 'select' },
      options: ['base64', 'url', 'hex', 'rot13'],
      description: 'The selected encoding/decoding algorithm',
    },
    mode: {
      control: { type: 'inline-radio' },
      options: ['encode', 'decode'],
      description: 'Operation mode (Encode vs Decode)',
    },
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    selectedAlgorithm: 'base64',
    mode: 'encode',
  },
  render: (args) => html`
    <div
      style="padding: 2rem; max-width: 600px; background: var(--bg-main); border-radius: 0.5rem;"
    >
      <algorithm-selector
        .selectedAlgorithm="${args.selectedAlgorithm}"
        .mode="${args.mode}"
      ></algorithm-selector>
    </div>
  `,
};
