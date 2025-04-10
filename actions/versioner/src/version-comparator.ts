import * as semver from 'semver';

export interface VersionInfo {
  name: string;
  cleanName: string;
  isSemver: boolean;
  isBranch: boolean;
}

export class VersionComparator {
  /**
   * Normalizes version name by removing 'v' prefix if present
   */
  private static normalizeVersion(version: string): string {
    return version.replace(/^v/, '');
  }

  /**
   * Checks if the version is a valid semver version
   */
  public static isSemverVersion(version: string): boolean {
    return semver.valid(VersionComparator.normalizeVersion(version)) !== null;
  }

  /**
   * Compares two semver versions
   * Returns:
   * - negative number if a < b
   * - positive number if a > b
   * - 0 if a == b
   */
  public static compareSemverVersions(a: string, b: string): number {
    return semver.compare(
      VersionComparator.normalizeVersion(a),
      VersionComparator.normalizeVersion(b)
    );
  }

  /**
   * Creates VersionInfo object from version name
   */
  public static createVersionInfo(name: string, isBranch: boolean = false): VersionInfo {
    return {
      name,
      cleanName: VersionComparator.normalizeVersion(name),
      isSemver: VersionComparator.isSemverVersion(name),
      isBranch
    };
  }

  /**
   * Compares two versions according to semver rules
   * Returns:
   * - negative number if a < b
   * - positive number if a > b
   * - 0 if a == b
   */
  public static compareVersions(a: VersionInfo, b: VersionInfo): number {
    // If both are semver versions, compare using semver
    if (a.isSemver && b.isSemver) {
      return semver.rcompare(a.cleanName, b.cleanName);
    }

    // If only one is semver, it's considered higher
    if (a.isSemver && !b.isSemver) return -1;
    if (!a.isSemver && b.isSemver) return 1;

    // If both are branches, compare alphabetically
    if (a.isBranch && b.isBranch) {
      return a.name.localeCompare(b.name);
    }

    // If only one is a branch, it's considered higher
    if (a.isBranch && !b.isBranch) return -1;
    if (!a.isBranch && b.isBranch) return 1;

    // For non-semver tags, compare alphabetically
    return a.name.localeCompare(b.name);
  }

  /**
   * Finds the latest version from an array of versions
   */
  public static findLatestVersion(versions: VersionInfo[]): VersionInfo | null {
    if (versions.length === 0) return null;
    return versions.reduce((latest, current) =>
      VersionComparator.compareVersions(current, latest) < 0 ? current : latest
    );
  }
}
