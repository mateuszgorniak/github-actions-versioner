/**
 * Information about a specific version of a dependency
 */
export interface VersionInfo {
  version: string;
  name: string;
  cleanName: string;
  isBranch: boolean;
  isSemver: boolean;
  sha: string;
  date: Date;
}

/**
 * Result of checking a dependency version
 */
export interface CheckVersionResult {
  owner: string;
  repo: string;
  version: string;
  latestVersion: string;
  currentVersionSha: string;
  latestVersionSha: string;
  references: Array<{ filePath: string; lineNumber: number }>;
  error?: string;
  isUpToDate: boolean;
}

/**
 * Reference to a specific line in a file
 */
export interface FileReference {
  filePath: string;
  lineNumber: number;
}

/**
 * Represents a unique GitHub Action dependency
 */
export interface ActionDependency {
  owner: string;
  repo: string;
  version: string;
  references: FileReference[];
}

/**
 * Represents a unique dependency with its references
 */
export interface UniqueDependency {
  owner: string;
  repo: string;
  version: string;
  references: FileReference[];
}
