import { UniqueDependency } from './dependency-lister';
import { Octokit } from '@octokit/rest';

export interface VersionCheckResult {
  owner: string;
  repo: string;
  currentVersions: string[];
  latestVersion: string;
  isUpToDate: boolean;
  references: Array<{
    filePath: string;
    lineNumber: number;
    version: string;
  }>;
}

export interface LatestVersion {
  owner: string;
  repo: string;
  latestVersion: string;
}

export class VersionChecker {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  /**
   * Checks if the given dependency is up to date
   * @param dependency Compressed dependency to check
   * @returns Promise with version check result
   */
  public async checkVersion(dependency: UniqueDependency): Promise<LatestVersion> {
    try {
      const { data } = await this.octokit.repos.listTags({
        owner: dependency.owner,
        repo: dependency.repo,
        per_page: 1
      });

      if (!data || data.length === 0) {
        throw new Error('No tags found');
      }

      return {
        owner: dependency.owner,
        repo: dependency.repo,
        latestVersion: data[0].name
      };
    } catch (error) {
      throw new Error(
        `Failed to check version for ${dependency.owner}/${dependency.repo}: ${error}`
      );
    }
  }
}
