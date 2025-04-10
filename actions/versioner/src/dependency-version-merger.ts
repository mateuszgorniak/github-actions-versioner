import { ActionDependency } from './dependency-analyzer';
import { LatestVersion } from './version-checker';

export interface DependencyWithVersion extends ActionDependency {
  latestVersion?: string;
  currentVersionSha?: string;
  latestVersionSha?: string;
  isUpToDate?: boolean;
}

export class DependencyVersionMerger {
  mergeWithVersions(
    dependencies: ActionDependency[],
    latestVersions: LatestVersion[]
  ): DependencyWithVersion[] {
    const versionMap = new Map<string, LatestVersion>();
    latestVersions.forEach(version => {
      versionMap.set(`${version.owner}/${version.repo}`, version);
    });

    return dependencies.map(dep => {
      const latestVersion = versionMap.get(`${dep.owner}/${dep.repo}`);
      if (!latestVersion) {
        return {
          ...dep,
          latestVersion: undefined,
          currentVersionSha: undefined,
          latestVersionSha: undefined,
          isUpToDate: undefined
        };
      }
      return {
        ...dep,
        latestVersion: latestVersion.latestVersion,
        currentVersionSha: latestVersion.currentVersionSha,
        latestVersionSha: latestVersion.latestVersionSha,
        isUpToDate: latestVersion.currentVersionSha === latestVersion.latestVersionSha
      };
    });
  }
}
