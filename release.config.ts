import type { Options } from 'semantic-release';

const isDraft = process.env.IS_DRAFT === 'true';

const config: Options = {
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
        prepareCmd: 'npm pkg set version=${nextRelease.version} && echo "should_deploy=true" >> $GITHUB_OUTPUT',
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
