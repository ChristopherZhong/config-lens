import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './editor-component';

const meta: Meta = {
  title: 'Components/EditorComponent',
  component: 'editor-component',
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['json', 'yaml'],
      description: 'Document language syntax mode',
    },
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Editor visual theme',
    },
    content: {
      control: 'text',
      description: 'Editor document content text',
    },
  },
};

export default meta;
type Story = StoryObj;

const sampleValidJson = JSON.stringify(
  {
    $schema: 'https://www.schemastore.org/package.json',
    name: 'config-lens',
    version: '1.0.0',
    description: 'Modern JSON/YAML Config Tools',
    keywords: ['json', 'yaml', 'config', 'editor'],
    author: {
      name: 'ConfigLens Team',
      email: 'support@example.com',
    },
    features: ['Linting', 'Comparing', 'Formatting'],
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
      created: '2025-01-01T00:00:00Z',
      retries: 3,
    },
  })),
  null,
  2
);

const renderWithContainer = (args: any, height = '400px') => {
  const isDark = args.theme === 'dark';
  const background = isDark ? '#0a0a0a' : '#ffffff';
  const border = isDark ? '1px solid #333' : '1px solid #ccc';

  return html`
    <div style="height: ${height}; border: ${border}; border-radius: 8px; background: ${background}; overflow: hidden;">
      <editor-component
        .mode="${args.mode}"
        .theme="${args.theme}"
        .content="${args.content}"
      ></editor-component>
    </div>
  `;
};

export const JsonValid: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    content: sampleValidJson,
  },
  render: (args) => renderWithContainer(args),
};

export const JsonSyntaxError: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    content: sampleInvalidJson,
  },
  render: (args) => renderWithContainer(args),
};

export const YamlValid: Story = {
  args: {
    mode: 'yaml',
    theme: 'light',
    content: sampleValidYaml,
  },
  render: (args) => renderWithContainer(args),
};

export const YamlSyntaxError: Story = {
  args: {
    mode: 'yaml',
    theme: 'light',
    content: sampleInvalidYaml,
  },
  render: (args) => renderWithContainer(args),
};

export const EmptyContent: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    content: '',
  },
  render: (args) => renderWithContainer(args),
};

export const LargeDocumentWithAnnotations: Story = {
  args: {
    mode: 'json',
    theme: 'dark',
    content: largeDocument,
  },
  render: (args) => renderWithContainer(args, '450px'),
};
