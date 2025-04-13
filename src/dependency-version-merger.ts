import { ActionDependency } from './types';
import { LatestVersion } from './version-checker';

export interface DependencyWithVersion extends ActionDependency {
  latestVersion?: string;
  currentVersionSha?: string;
  latestVersionSha?: string;
  isUpToDate?: boolean;
  error?: string;
  references: Array<{
    filePath: string;
    lineNumber: number;
  }>;
}

export class DependencyVersionMerger {
  public mergeWithVersions(
    dependencies: ActionDependency[],
    latestVersions: LatestVersion[]
  ): DependencyWithVersion[] {
    return dependencies.map(dep => {
      const latestVersion = latestVersions.find(
        v => v.owner === dep.owner && v.repo === dep.repo && v.version === dep.version
      );

      if (!latestVersion) {
        return {
          ...dep,
          isUpToDate: undefined,
          references: []
        };
      }

      return {
        ...dep,
        latestVersion: latestVersion.latestVersion,
        currentVersionSha: latestVersion.currentVersionSha,
        latestVersionSha: latestVersion.latestVersionSha,
        isUpToDate: latestVersion.version === latestVersion.latestVersion,
        error: latestVersion.error,
        references: latestVersion.references
      };
    });
  }
}
