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

const sampleValidJson = JSON.stringify(
  {
    "$schema": "https://www.schemastore.org/package.json",
    name: "config-lens",
    version: "1.0.0",
    description: "Modern JSON/YAML Config Tools",
    keywords: ["json", "yaml", "config", "editor"],
    author: {
      name: "ConfigLens Team",
      email: "support@example.com"
    },
    features: ["Linting", "Comparing", "Formatting"]
  },
  null,
  2
);

const sampleInvalidJson = `{
  "name": "config-lens",
  "version": 1.0.0,
  "description": "Unclosed string key,
  "missingComma": true
  "syntaxError":
}`;

const sampleValidYaml = `name: config-lens
version: 1.0.0
description: Modern JSON/YAML Config Tools
keywords:
  - json
  - yaml
  - config
author:
  name: ConfigLens Team
  email: support@example.com
features:
  - Linting
  - Comparing
  - Formatting
`;

const sampleInvalidYaml = `name: config-lens
version: 1.0.0
description: invalid indent
  features:
- linting
 - syntax error: [
`;

const largeDocument = JSON.stringify(
  Array.from({ length: 25 }, (_, idx) => ({
    id: idx + 1,
    title: `Configuration Item #${idx + 1}`,
    enabled: idx % 2 === 0,
    tags: [`tag-${idx}`, 'environment', 'production'],
    meta: {
      created: "2025-01-01T00:00:00Z",
      retries: 3
    }
  })),
  null,
  2
);

export const JsonLightValid: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    content: sampleValidJson,
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

export const JsonDarkValid: Story = {
  args: {
    mode: 'json',
    theme: 'dark',
    content: sampleValidJson,
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

export const JsonSyntaxError: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    content: sampleInvalidJson,
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

export const YamlLightValid: Story = {
  args: {
    mode: 'yaml',
    theme: 'light',
    content: sampleValidYaml,
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

export const YamlDarkValid: Story = {
  args: {
    mode: 'yaml',
    theme: 'dark',
    content: sampleValidYaml,
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

export const YamlSyntaxError: Story = {
  args: {
    mode: 'yaml',
    theme: 'light',
    content: sampleInvalidYaml,
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

export const EmptyContent: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    content: '',
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

export const LargeDocumentWithAnnotations: Story = {
  args: {
    mode: 'json',
    theme: 'dark',
    content: largeDocument,
  },
  render: (args) => html`
    <div style="height: 450px; border: 1px solid #333; border-radius: 8px; background: #0a0a0a;">
      <editor-component
        .mode="${args.mode}"
        .theme="${args.theme}"
        .content="${args.content}"
      ></editor-component>
    </div>
  `,
};
