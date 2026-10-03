/**
 * Parses a version string into numeric components [major, minor, patch].
 */
export function parseVersion(version: string): number[] {
  const cleaned = version.trim().replace(/^v/i, '');
  const mainPart = cleaned.split('-')[0];
  const parts = mainPart.split('.').map((p) => {
    const num = parseInt(p, 10);
    return isNaN(num) ? 0 : num;
  });

  while (parts.length < 3) {
    parts.push(0);
  }
  return parts.slice(0, 3);
}

/**
 * Checks if latestVersion is strictly greater than currentVersion according to semver.
 */
export function isNewerVersion(currentVersion: string, latestVersion: string): boolean {
  if (!currentVersion || !latestVersion) return false;

  const current = parseVersion(currentVersion);
  const latest = parseVersion(latestVersion);

  for (let i = 0; i < 3; i++) {
    if (latest[i] > current[i]) return true;
    if (latest[i] < current[i]) return false;
  }

  return false;
}

export interface VersionCheckResult {
  newVersionAvailable: boolean;
  latestVersion: string | null;
}

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/ChristopherZhong/linter/releases/latest';

/**
 * Fetches the latest release tag from GitHub and checks if a newer version is available.
 */
export async function checkLatestRelease(
  currentVersion: string,
  fetchFn: typeof fetch = fetch
): Promise<VersionCheckResult> {
  try {
    const response = await fetchFn(GITHUB_RELEASES_URL, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      return { newVersionAvailable: false, latestVersion: null };
    }

    const data = await response.json();
    const tagName = data?.tag_name || data?.name;

    if (typeof tagName !== 'string') {
      return { newVersionAvailable: false, latestVersion: null };
    }

    const cleanLatest = tagName.trim().replace(/^v/i, '');
    const hasNewer = isNewerVersion(currentVersion, cleanLatest);

    return {
      newVersionAvailable: hasNewer,
      latestVersion: cleanLatest,
    };
  } catch {
    // Fail silently on network errors or rate limit issues
    return { newVersionAvailable: false, latestVersion: null };
  }
}
