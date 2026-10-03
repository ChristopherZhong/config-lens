import type { GlobalConfig } from 'semantic-release';

const isDraft = process.env.IS_DRAFT === 'true';

const config: GlobalConfig = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'npm pkg set version=${nextRelease.version}',
      },
    ],
    [
      '@semantic-release/github',
      {
        draftRelease: isDraft,
      },
    ],
  ],
};

export default config;
