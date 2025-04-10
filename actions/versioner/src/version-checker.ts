import { UniqueDependency } from './dependency-lister';
import { Octokit } from '@octokit/rest';

export interface LatestVersion {
  owner: string;
  repo: string;
  version: string;
  latestVersion: string;
  currentVersionSha: string;
  latestVersionSha: string;
  references: Array<{
    filePath: string;
    lineNumber: number;
  }>;
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
      // If tag not found, try to get the ref as a branch
      const { data } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${ref}`
      });
      return data.object.sha;
    }
  }

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

      const currentVersionSha = await this.getRefSha(
        dependency.owner,
        dependency.repo,
        dependency.version
      );

      return {
        owner: dependency.owner,
        repo: dependency.repo,
        version: dependency.version,
        latestVersion,
        currentVersionSha,
        latestVersionSha,
        references: dependency.references
      };
    } catch (error) {
      throw new Error(
        `Failed to check version for ${dependency.owner}/${dependency.repo}: ${error}`
      );
    }
  }
}
