export interface VersionComponents {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Parses a version string into numeric components { major, minor, patch } using RegExp with named groups.
 */
export function parseVersion(version: string): VersionComponents {
  const match = version.trim().match(/^v?(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?/i);
  const groups = match?.groups;

  return {
    major: groups?.major ? parseInt(groups.major, 10) : 0,
    minor: groups?.minor ? parseInt(groups.minor, 10) : 0,
    patch: groups?.patch ? parseInt(groups.patch, 10) : 0,
  };
}

/**
 * Checks if latestVersion is strictly greater than currentVersion according to semver.
 */
export function isNewerVersion(currentVersion: string, latestVersion: string): boolean {
  if (!currentVersion || !latestVersion) return false;

  const current = parseVersion(currentVersion);
  const latest = parseVersion(latestVersion);

  if (latest.major > current.major) return true;
  if (latest.major < current.major) return false;

  if (latest.minor > current.minor) return true;
  if (latest.minor < current.minor) return false;

  if (latest.patch > current.patch) return true;
  if (latest.patch < current.patch) return false;

  return false;
}

export interface VersionCheckResult {
  newVersionAvailable: boolean;
  latestVersion: string | null;
}

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/ChristopherZhong/config-lens/releases/latest';

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
