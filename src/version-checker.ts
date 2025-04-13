import { Octokit } from '@octokit/rest';
import { VersionParser } from './version-comparator';
import { ActionDependency, VersionInfo, CheckVersionResult } from './types';

/**
 * Handles the complete version verification process
 * - Manages GitHub API communication
 * - Coordinates version verification workflow
 * - Caches version information
 * - Handles commit information retrieval
 * - Determines version update strategy
 */
export class VersionVerifier {
  private octokit: Octokit;
  private versionCache: Map<string, VersionInfo>;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
    this.versionCache = new Map();
  }

  private async getCommitInfo(owner: string, repo: string, ref: string): Promise<{ sha: string; date: string }> {
    try {
      const { data } = await this.octokit.repos.getCommit({
        owner,
        repo,
        ref
      });
      return {
        sha: data.sha,
        date: data.commit.committer?.date || data.commit.author?.date || new Date().toISOString()
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  private async getVersionInfo(owner: string, repo: string, version: string): Promise<VersionInfo> {
    const cacheKey = `${owner}/${repo}/${version}`;
    if (this.versionCache.has(cacheKey)) {
      return this.versionCache.get(cacheKey)!;
    }

    try {
      const { data } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `tags/${version}`
      });
      const commitInfo = await this.getCommitInfo(owner, repo, data.object.sha);
      const info = VersionParser.createVersionInfo(
        version,
        false,
        commitInfo.sha,
        new Date(commitInfo.date)
      );
      this.versionCache.set(cacheKey, info);
      return info;
    } catch (error) {
      try {
        const { data } = await this.octokit.git.getRef({
          owner,
          repo,
          ref: `heads/${version}`
        });
        const commitInfo = await this.getCommitInfo(owner, repo, data.object.sha);
        const info = VersionParser.createVersionInfo(
          version,
          true,
          commitInfo.sha,
          new Date(commitInfo.date)
        );
        this.versionCache.set(cacheKey, info);
        return info;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(errorMessage);
      }
    }
  }

  private async findLatestVersion(owner: string, repo: string): Promise<VersionInfo> {
    try {
      const { data: tags } = await this.octokit.repos.listTags({
        owner,
        repo,
        per_page: 100
      });

      if (tags.length === 0) {
        const { data: repoInfo } = await this.octokit.repos.get({
          owner,
          repo
        });
        return this.getVersionInfo(owner, repo, repoInfo.default_branch);
      }

      const versions = await Promise.all(
        tags.map(async (tag: { name: string; commit: { sha: string } }) => {
          const commitInfo = await this.getCommitInfo(owner, repo, tag.commit.sha);
          return VersionParser.createVersionInfo(
            tag.name,
            false,
            tag.commit.sha,
            new Date(commitInfo.date)
          );
        })
      );

      return VersionParser.findLatestVersion(versions);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async checkVersion(dependency: ActionDependency): Promise<CheckVersionResult> {
    try {
      const currentVersionInfo = await this.getVersionInfo(dependency.owner, dependency.repo, dependency.version);
      const latestVersionInfo = await this.findLatestVersion(dependency.owner, dependency.repo);

      // If both versions point to the same commit, they are equal
      const isSameCommit = currentVersionInfo.sha === latestVersionInfo.sha;
      const isUpToDate = isSameCommit || VersionParser.compareVersionsSemver(currentVersionInfo, latestVersionInfo) >= 0;

      return {
        owner: dependency.owner,
        repo: dependency.repo,
        version: dependency.version,
        latestVersion: isSameCommit ? dependency.version : latestVersionInfo.version,
        currentVersionSha: currentVersionInfo.sha,
        latestVersionSha: latestVersionInfo.sha,
        references: dependency.references,
        isUpToDate
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        owner: dependency.owner,
        repo: dependency.repo,
        version: dependency.version,
        latestVersion: dependency.version,
        currentVersionSha: 'unknown',
        latestVersionSha: 'unknown',
        references: dependency.references,
        error: errorMessage,
        isUpToDate: false
      };
    }
  }
}

export type LatestVersion = CheckVersionResult;
