import * as semver from 'semver';
import { VersionInfo } from './types';

/**
 * Handles parsing and analysis of version strings
 * - Parses version formats (semver, tags, branches)
 * - Normalizes version strings
 * - Compares versions
 * - Analyzes version types
 */
export class VersionParser {
  /**
   * Normalizes a version string for comparison
   */
  static normalizeVersion(version: string): string {
    return version.replace(/^v/, '');
  }

  /**
   * Compares two version strings
   * Returns:
   * -1 if version1 < version2
   * 0 if version1 == version2
   * 1 if version1 > version2
   */
  static compareVersions(version1: string, version2: string): number {
    const v1 = this.normalizeVersion(version1);
    const v2 = this.normalizeVersion(version2);

    // If both are valid semver versions, use semver comparison
    if (semver.valid(v1) && semver.valid(v2)) {
      return semver.compare(v1, v2);
    }

    // Special handling for 'latest' tag
    if (version1 === 'latest') return 1;
    if (version2 === 'latest') return -1;

    // If only one is semver, prefer the semver version
    if (semver.valid(v1)) return 1;
    if (semver.valid(v2)) return -1;

    // For non-semver versions, use lexicographical comparison
    return v1.localeCompare(v2, undefined, { numeric: true });
  }

  /**
   * Finds the latest version from a list of version infos
   */
  static findLatestVersion(versions: VersionInfo[]): VersionInfo {
    if (versions.length === 0) {
      throw new Error('No versions provided');
    }

    return versions.reduce((latest, current) => {
      // Special handling for 'latest' tag
      if (current.name === 'latest') return current;
      if (latest.name === 'latest') return latest;

      // If both are semver versions, use semver comparison
      if (current.isSemver && latest.isSemver) {
        const comparison = semver.compare(
          this.normalizeVersion(current.version),
          this.normalizeVersion(latest.version)
        );
        return comparison > 0 ? current : latest;
      }

      // If only one is semver, prefer the semver version
      if (current.isSemver) return current;
      if (latest.isSemver) return latest;

      // For non-semver versions, compare by date
      return current.date.getTime() > latest.date.getTime() ? current : latest;
    });
  }

  /**
   * Creates a VersionInfo object
   */
  static createVersionInfo(
    version: string,
    isBranch: boolean = false,
    sha: string = '',
    date: Date = new Date()
  ): VersionInfo {
    return {
      version,
      name: version,
      cleanName: this.normalizeVersion(version),
      isBranch,
      isSemver: this.isSemverVersion(version),
      sha,
      date
    };
  }

  /**
   * Checks if version is a valid semver version
   */
  public static isSemverVersion(version: string): boolean {
    return semver.valid(this.normalizeVersion(version)) !== null;
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
      VersionParser.normalizeVersion(a),
      VersionParser.normalizeVersion(b)
    );
  }

  /**
   * Creates VersionInfo object from version name
   */
  public static createVersionInfoFromName(
    name: string,
    isBranch: boolean = false,
    sha: string = '',
    date: Date = new Date()
  ): VersionInfo {
    return {
      name,
      cleanName: VersionParser.normalizeVersion(name),
      isSemver: VersionParser.isSemverVersion(name),
      isBranch,
      sha,
      date,
      version: name
    };
  }

  /**
   * Compares two versions according to semver rules
   * Returns:
   * - negative number if a < b
   * - positive number if a > b
   * - 0 if a == b
   */
  public static compareVersionsSemver(a: VersionInfo, b: VersionInfo): number {
    // If both versions point to the same commit, they are equal
    if (a.sha === b.sha) {
      return 0;
    }

    // If both are semver versions, compare using semver
    if (a.isSemver && b.isSemver) {
      const comparison = semver.compare(a.cleanName, b.cleanName);
      if (comparison !== 0) return comparison;
      // If versions are equal, prefer newer commit
      return a.date.getTime() - b.date.getTime();
    }

    // If only one is semver, prefer semver version
    if (a.isSemver && !b.isSemver) return 1;
    if (!a.isSemver && b.isSemver) return -1;

    // Special handling for 'latest' tag
    if (a.name === 'latest') return 1;
    if (b.name === 'latest') return -1;

    // If both are branches, compare by date
    if (a.isBranch && b.isBranch) {
      return a.date.getTime() - b.date.getTime();
    }

    // If only one is a branch, prefer tags over branches
    if (a.isBranch && !b.isBranch) return -1;
    if (!a.isBranch && b.isBranch) return 1;

    // For non-semver tags, compare by date first
    const dateComparison = a.date.getTime() - b.date.getTime();
    if (dateComparison !== 0) return dateComparison;

    // If dates are equal, compare alphabetically
    return a.name.localeCompare(b.name);
  }
}
