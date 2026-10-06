import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './diff-component';

const meta: Meta = {
  title: 'Components/DiffComponent',
  component: 'diff-component',
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
      description: 'Diff view visual theme',
    },
    original: {
      control: 'text',
      description: 'Original content (Side A / Left)',
    },
    modified: {
      control: 'text',
      description: 'Modified content (Side B / Right)',
    },
  },
};

export default meta;
type Story = StoryObj;

const originalJson = JSON.stringify(
  {
    name: 'config-lens',
    version: '1.0.0',
    status: 'active',
    features: ['linting', 'formatting'],
  },
  null,
  2
);

const modifiedJson = JSON.stringify(
  {
    name: 'config-lens',
    version: '1.1.0',
    status: 'active',
    features: ['linting', 'formatting', 'diffing'],
    newSetting: true,
  },
  null,
  2
);

const originalYaml = `name: config-lens
version: 1.0.0
status: active
features:
  - linting
  - formatting
`;

const modifiedYaml = `name: config-lens
version: 1.1.0
status: active
features:
  - linting
  - formatting
  - diffing
newSetting: true
`;

const renderWithContainer = (args: any, height = '400px') => {
  const isDark = args.theme === 'dark';
  const background = isDark ? '#0a0a0a' : '#ffffff';
  const border = isDark ? '1px solid #333' : '1px solid #ccc';

  return html`
    <div style="height: ${height}; border: ${border}; border-radius: 8px; background: ${background}; overflow: hidden;">
      <diff-component
        .mode="${args.mode}"
        .theme="${args.theme}"
        .original="${args.original}"
        .modified="${args.modified}"
      ></diff-component>
    </div>
  `;
};

export const JsonDiff: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    original: originalJson,
    modified: modifiedJson,
  },
  render: (args) => renderWithContainer(args),
};

export const YamlDiff: Story = {
  args: {
    mode: 'yaml',
    theme: 'light',
    original: originalYaml,
    modified: modifiedYaml,
  },
  render: (args) => renderWithContainer(args),
};

export const IdenticalDocumentsNoDiff: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    original: originalJson,
    modified: originalJson,
  },
  render: (args) => renderWithContainer(args),
};

export const EmptyDocuments: Story = {
  args: {
    mode: 'json',
    theme: 'light',
    original: '',
    modified: '',
  },
  render: (args) => renderWithContainer(args),
};
