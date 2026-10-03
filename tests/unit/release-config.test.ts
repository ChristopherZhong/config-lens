import { describe, it, expect } from 'vitest';
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import releaseConfig from '../../release.config';

describe('release.config.ts', () => {
  const commitAnalyzerPlugin = releaseConfig.plugins?.find(
    (plugin): plugin is [string, Record<string, unknown>] =>
      Array.isArray(plugin) && plugin[0] === '@semantic-release/commit-analyzer'
  );

  const pluginConfig = commitAnalyzerPlugin ? commitAnalyzerPlugin[1] : {};

  it('triggers a patch release for refactor commits', async () => {
    const result = await analyzeCommits(pluginConfig, {
      commits: [{ hash: 'abc1234', message: 'refactor: rename app from Linter.ai to ConfigLens' }],
      logger: { log: () => {}, error: () => {} } as unknown as any,
    });
    expect(result).toBe('patch');
  });

  it('triggers a patch release for chore commits', async () => {
    const result = await analyzeCommits(pluginConfig, {
      commits: [{ hash: 'abc1234', message: 'chore: update dependencies' }],
      logger: { log: () => {}, error: () => {} } as unknown as any,
    });
    expect(result).toBe('patch');
  });

  it('triggers a minor release for feat commits', async () => {
    const result = await analyzeCommits(pluginConfig, {
      commits: [{ hash: 'abc1234', message: 'feat: add new feature' }],
      logger: { log: () => {}, error: () => {} } as unknown as any,
    });
    expect(result).toBe('minor');
  });

  it('triggers a patch release for fix commits', async () => {
    const result = await analyzeCommits(pluginConfig, {
      commits: [{ hash: 'abc1234', message: 'fix: fix bug in editor' }],
      logger: { log: () => {}, error: () => {} } as unknown as any,
    });
    expect(result).toBe('patch');
  });

  it('returns null (no release) for docs commits', async () => {
    const result = await analyzeCommits(pluginConfig, {
      commits: [{ hash: 'abc1234', message: 'docs: update documentation' }],
      logger: { log: () => {}, error: () => {} } as unknown as any,
    });
    expect(result).toBeNull();
  });
});
