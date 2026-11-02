import type { GlobalConfig } from 'semantic-release';
import { env } from 'node:process';

const isDraft = env.IS_DRAFT === 'true';

const config: GlobalConfig = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'refactor', release: 'patch' },
          { type: 'chore', release: 'patch' },
        ],
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
        prepareCmd: 'npm pkg set version=${nextRelease.version} --workspace=config-lens && echo "should_deploy=true" >> $GITHUB_OUTPUT',
      },
    ],
    [
      '@semantic-release/github',
      {
        draftRelease: isDraft,
      },
    ],
  ],
  repositoryUrl: 'https://github.com/ChristopherZhong/tools.git',
  tagFormat: 'v${version}',
};

export default config;
