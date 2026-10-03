import { describe, it, expect, vi } from 'vitest';
import { parseVersion, isNewerVersion, checkLatestRelease } from '~src/utils/version-check';

describe('version-check utility', () => {
  describe('parseVersion', () => {
    it('parses semver string correctly', () => {
      expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
      expect(parseVersion('v1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
      expect(parseVersion('2.0')).toEqual({ major: 2, minor: 0, patch: 0 });
      expect(parseVersion('1.0.0-beta.1')).toEqual({ major: 1, minor: 0, patch: 0 });
    });

    it('handles invalid or empty strings gracefully', () => {
      expect(parseVersion('')).toEqual({ major: 0, minor: 0, patch: 0 });
      expect(parseVersion('invalid')).toEqual({ major: 0, minor: 0, patch: 0 });
    });
  });

  describe('isNewerVersion', () => {
    it('correctly identifies newer patch, minor, and major versions', () => {
      expect(isNewerVersion('1.0.0', '1.0.1')).toBe(true);
      expect(isNewerVersion('1.0.0', '1.1.0')).toBe(true);
      expect(isNewerVersion('1.0.0', '2.0.0')).toBe(true);
      expect(isNewerVersion('v1.0.0', 'v1.0.1')).toBe(true);
    });

    it('returns false when latest version is same or older', () => {
      expect(isNewerVersion('1.0.0', '1.0.0')).toBe(false);
      expect(isNewerVersion('1.1.0', '1.0.9')).toBe(false);
      expect(isNewerVersion('2.0.0', '1.9.9')).toBe(false);
    });

    it('returns false if inputs are missing', () => {
      expect(isNewerVersion('', '1.0.0')).toBe(false);
      expect(isNewerVersion('1.0.0', '')).toBe(false);
    });
  });

  describe('checkLatestRelease', () => {
    it('returns newVersionAvailable = true when a newer version release exists', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tag_name: 'v1.1.0' }),
      } as Response);

      const result = await checkLatestRelease('1.0.0', mockFetch);
      expect(result.newVersionAvailable).toBe(true);
      expect(result.latestVersion).toBe('1.1.0');
    });

    it('returns newVersionAvailable = false when release is same or older version', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tag_name: 'v1.0.0' }),
      } as Response);

      const result = await checkLatestRelease('1.0.0', mockFetch);
      expect(result.newVersionAvailable).toBe(false);
      expect(result.latestVersion).toBe('1.0.0');
    });

    it('handles HTTP error gracefully without throwing', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      } as Response);

      const result = await checkLatestRelease('1.0.0', mockFetch);
      expect(result.newVersionAvailable).toBe(false);
      expect(result.latestVersion).toBeNull();
    });

    it('handles network failure gracefully without throwing', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await checkLatestRelease('1.0.0', mockFetch);
      expect(result.newVersionAvailable).toBe(false);
      expect(result.latestVersion).toBeNull();
    });
  });
});
