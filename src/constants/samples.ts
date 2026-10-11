import * as jsYaml from 'js-yaml';

export const DEFAULT_SAMPLE_OBJECT = {
  $schema: 'https://www.schemastore.org/package.json',
  name: 'config-lens',
  version: '1.0.0',
  description: 'Modern web-based JSON/YAML config tools with schema validation, side-by-side diffing, and inline annotations.',
  keywords: [
    'json',
    'yaml',
    'config',
    'editor',
    'diff',
    'validator',
    'schema',
  ],
  homepage: 'https://christopherzhong.github.io/config-lens',
  bugs: {
    url: 'https://github.com/ChristopherZhong/config-lens/issues',
  },
  repository: {
    type: 'git',
    url: 'git+https://github.com/ChristopherZhong/config-lens.git',
  },
  license: 'Apache-2.0',
  author: 'Christopher Zhong',
  type: 'module',
  main: 'index.html',
  scripts: {
    dev: 'vite',
    build: 'tsc && vite build',
    preview: 'vite preview',
    test: 'vitest run',
    'test:watch': 'vitest',
    'test:e2e': 'playwright test',
    storybook: 'storybook dev -p 6006',
    'build-storybook': 'storybook build -o dist/storybook',
  },
  dependencies: {
    '@codemirror/lang-json': '^6.0.1',
    '@codemirror/lang-yaml': '^6.0.1',
    '@codemirror/lint': '^6.8.4',
    '@codemirror/merge': '^6.7.3',
    '@codemirror/state': '^6.5.2',
    '@codemirror/theme-one-dark': '^6.1.2',
    '@codemirror/view': '^6.36.3',
    ajv: '^8.17.1',
    'ajv-formats': '^3.0.1',
    codemirror: '^6.0.1',
    'js-yaml': '^4.1.0',
    lit: '^3.2.1',
  },
  devDependencies: {
    '@playwright/test': '^1.51.0',
    '@storybook/addon-essentials': '^8.6.4',
    '@storybook/web-components-vite': '^8.6.4',
    '@types/js-yaml': '^4.0.9',
    '@types/node': '^22.13.10',
    typescript: '~5.7.2',
    vite: '^6.2.0',
    vitest: '^3.0.7',
  },
  engines: {
    node: '>=24',
  },
};

export const DEFAULT_JSON = JSON.stringify(DEFAULT_SAMPLE_OBJECT, null, 2);

export const DEFAULT_YAML = jsYaml.dump(DEFAULT_SAMPLE_OBJECT);

export const sampleValidJson = DEFAULT_JSON;

export const sampleInvalidJson = `{
  "name": "config-lens",
  "version": 1.0.0,
  "description": "Unclosed string key,
  "missingComma": true
  "syntaxError":
}`;

export const sampleValidYaml = DEFAULT_YAML;

export const sampleInvalidYaml = `name: config-lens
version: 1.0.0
description: invalid indent
  features:
- linting
 - syntax error: [
`;

const sampleOriginalObject = {
  name: 'config-lens',
  version: '1.0.0',
  status: 'active',
  features: ['linting', 'formatting'],
};

const sampleModifiedObject = {
  name: 'config-lens',
  version: '1.1.0',
  status: 'active',
  features: ['linting', 'formatting', 'diffing'],
  newSetting: true,
};

export const originalJson = JSON.stringify(sampleOriginalObject, null, 2);

export const modifiedJson = JSON.stringify(sampleModifiedObject, null, 2);

export const originalYaml = jsYaml.dump(sampleOriginalObject);

export const modifiedYaml = jsYaml.dump(sampleModifiedObject);
