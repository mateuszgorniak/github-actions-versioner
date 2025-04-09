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
  currentVersionSha?: string;
  latestVersionSha: string;
}

export class VersionChecker {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  private async getRefSha(owner: string, repo: string, ref: string): Promise<string> {
    try {
      const { data } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `tags/${ref}`
      });
      return data.object.sha;
    } catch (error) {
      throw new Error(`Failed to get SHA for ref ${ref}: ${error}`);
    }
  }

  /**
   * Checks if the given dependency is up to date by comparing commit SHAs
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

      const latestVersion = data[0].name;
      const latestVersionSha = await this.getRefSha(
        dependency.owner,
        dependency.repo,
        latestVersion
      );

      let currentVersionSha: string | undefined;
      if (dependency.version) {
        currentVersionSha = await this.getRefSha(
          dependency.owner,
          dependency.repo,
          dependency.version
        );
      }

      return {
        owner: dependency.owner,
        repo: dependency.repo,
        latestVersion,
        currentVersionSha,
        latestVersionSha
      };
    } catch (error) {
      throw new Error(
        `Failed to check version for ${dependency.owner}/${dependency.repo}: ${error}`
      );
    }
  }
}
