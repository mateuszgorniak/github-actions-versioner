import { UniqueDependency } from './dependency-lister';
import { Octokit } from '@octokit/rest';
import { VersionComparator, VersionInfo } from './version-comparator';

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
  error?: string;
}

interface CommitInfo {
  sha: string;
  date: Date;
}

interface TagInfo {
  name: string;
  commitInfo: CommitInfo;
}

export class VersionChecker {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  private async getCommitInfo(
    owner: string,
    repo: string,
    ref: string
  ): Promise<CommitInfo> {
    try {
      // First try to get the reference directly
      const { data: refData } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: ref
      });
      const { data: commit } = await this.octokit.repos.getCommit({
        owner,
        repo,
        ref: refData.object.sha
      });
      return {
        sha: refData.object.sha,
        date: new Date(commit.commit.committer?.date || commit.commit.author?.date || '')
      };
    } catch (error) {
      // If direct reference fails, try as tag
      try {
        const { data: tagRef } = await this.octokit.git.getRef({
          owner,
          repo,
          ref: `tags/${ref}`
        });
        const { data: commit } = await this.octokit.repos.getCommit({
          owner,
          repo,
          ref: tagRef.object.sha
        });
        return {
          sha: tagRef.object.sha,
          date: new Date(commit.commit.committer?.date || commit.commit.author?.date || '')
        };
      } catch (tagError) {
        // If tag fails, try as branch
        try {
          const { data: branchRef } = await this.octokit.git.getRef({
            owner,
            repo,
            ref: `heads/${ref}`
          });
          const { data: commit } = await this.octokit.repos.getCommit({
            owner,
            repo,
            ref: branchRef.object.sha
          });
          return {
            sha: branchRef.object.sha,
            date: new Date(commit.commit.committer?.date || commit.commit.author?.date || '')
          };
        } catch (branchError) {
          throw new Error(`Reference ${ref} not found as either tag or branch`);
        }
      }
    }
  }

  private findHighestSemverTag(tags: TagInfo[]): TagInfo | null {
    const semverTags = tags.filter(tag => VersionComparator.isSemverVersion(tag.name));
    if (semverTags.length === 0) return null;

    return semverTags.reduce((highest, current) => {
      const comparison = VersionComparator.compareSemverVersions(current.name, highest.name);
      return comparison > 0 ? current : highest;
    });
  }

  private findLatestCustomTag(tags: TagInfo[]): TagInfo | null {
    const customTags = tags.filter(tag => !VersionComparator.isSemverVersion(tag.name));
    if (customTags.length === 0) return null;

    // Prefer 'latest' tag if it exists
    const latestTag = customTags.find(tag => tag.name === 'latest');
    if (latestTag) return latestTag;

    // Otherwise, use the most recent tag by commit date
    return customTags.reduce((latest, current) =>
      current.commitInfo.date > latest.commitInfo.date ? current : latest
    );
  }

  public async checkVersion(dependency: UniqueDependency): Promise<LatestVersion> {
    try {
      // Get current version commit info
      const currentVersionInfo = await this.getCommitInfo(
        dependency.owner,
        dependency.repo,
        dependency.version
      );

      // First try to get tags
      const { data: tags } = await this.octokit.repos.listTags({
        owner: dependency.owner,
        repo: dependency.repo,
        per_page: 100
      });

      let latestVersion: string;
      let latestVersionInfo: CommitInfo;

      if (tags && tags.length > 0) {
        // Get commit info for each tag
        const tagInfos = await Promise.all(
          tags.map(async tag => ({
            name: tag.name,
            commitInfo: await this.getCommitInfo(dependency.owner, dependency.repo, tag.name)
          }))
        );

        // Find highest semver tag
        const highestSemverTag = this.findHighestSemverTag(tagInfos);

        if (highestSemverTag) {
          // If current version is also semver, compare versions
          if (VersionComparator.isSemverVersion(dependency.version)) {
            const comparison = VersionComparator.compareSemverVersions(
              highestSemverTag.name,
              dependency.version
            );
            if (comparison > 0) {
              // Higher version found
              latestVersion = highestSemverTag.name;
              latestVersionInfo = highestSemverTag.commitInfo;
            } else {
              // No higher version found
              return {
                owner: dependency.owner,
                repo: dependency.repo,
                version: dependency.version,
                latestVersion: dependency.version,
                currentVersionSha: currentVersionInfo.sha,
                latestVersionSha: currentVersionInfo.sha,
                references: dependency.references
              };
            }
          } else {
            // Current version is not semver (e.g., branch), suggest the highest semver
            latestVersion = highestSemverTag.name;
            latestVersionInfo = highestSemverTag.commitInfo;
          }
        } else {
          // No semver tags found, find latest custom tag
          const latestCustomTag = this.findLatestCustomTag(tagInfos);
          if (latestCustomTag) {
            latestVersion = latestCustomTag.name;
            latestVersionInfo = latestCustomTag.commitInfo;
          } else {
            // No tags found at all, use default branch
            const { data: repo } = await this.octokit.repos.get({
              owner: dependency.owner,
              repo: dependency.repo
            });

            const defaultBranch = repo.default_branch;
            const defaultBranchInfo = await this.getCommitInfo(
              dependency.owner,
              dependency.repo,
              defaultBranch
            );

            latestVersion = defaultBranch;
            latestVersionInfo = defaultBranchInfo;
          }
        }
      } else {
        // If no tags found, try to get the default branch
        const { data: repo } = await this.octokit.repos.get({
          owner: dependency.owner,
          repo: dependency.repo
        });

        const defaultBranch = repo.default_branch;
        const defaultBranchInfo = await this.getCommitInfo(
          dependency.owner,
          dependency.repo,
          defaultBranch
        );

        latestVersion = defaultBranch;
        latestVersionInfo = defaultBranchInfo;
      }

      return {
        owner: dependency.owner,
        repo: dependency.repo,
        version: dependency.version,
        latestVersion,
        currentVersionSha: currentVersionInfo.sha,
        latestVersionSha: latestVersionInfo.sha,
        references: dependency.references
      };
    } catch (error) {
      // Instead of throwing an error, return the current version as the latest
      return {
        owner: dependency.owner,
        repo: dependency.repo,
        version: dependency.version,
        latestVersion: dependency.version,
        currentVersionSha: 'unknown',
        latestVersionSha: 'unknown',
        references: dependency.references,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
