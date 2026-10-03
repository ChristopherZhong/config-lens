import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './editor-component';

const meta: Meta = {
  title: 'Components/EditorComponent',
  component: 'editor-component',
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['json', 'yaml'] },
    theme: { control: 'select', options: ['light', 'dark'] },
    content: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

const sampleJson = JSON.stringify(
  {
    name: "config-lens",
    version: "1.0.0",
    description: "Modern JSON/YAML Config Tools",
    features: ["Linting", "Comparing", "Formatting"]
  },
  null,
  2
);

const sampleYaml = `name: config-lens
version: 1.0.0
description: Modern JSON/YAML Config Tools
features:
  - Linting
  - Comparing
  - Formatting
`;

export const JsonLight: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    content: sampleJson,
  },
  render: (args) => html`
    <div style="height: 400px; border: 1px solid #ccc; border-radius: 8px;">
      <editor-component
        .mode="${args.mode}"
        .theme="${args.theme}"
        .content="${args.content}"
      ></editor-component>
    </div>
  `,
};

export const JsonDark: Story = {
  args: {
    mode: 'json',
    theme: 'dark',
    content: sampleJson,
  },
  render: (args) => html`
    <div style="height: 400px; border: 1px solid #333; border-radius: 8px; background: #0a0a0a;">
      <editor-component
        .mode="${args.mode}"
        .theme="${args.theme}"
        .content="${args.content}"
      ></editor-component>
    </div>
  `,
};

export const YamlLight: Story = {
  args: {
    mode: 'yaml',
    theme: 'light',
    content: sampleYaml,
  },
  render: (args) => html`
    <div style="height: 400px; border: 1px solid #ccc; border-radius: 8px;">
      <editor-component
        .mode="${args.mode}"
        .theme="${args.theme}"
        .content="${args.content}"
      ></editor-component>
    </div>
  `,
};
