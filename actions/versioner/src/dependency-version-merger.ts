import { ActionDependency } from './dependency-analyzer';
import { LatestVersion } from './version-checker';

export interface DependencyWithVersion extends ActionDependency {
  latestVersion?: string;
  isUpToDate?: boolean;
}

export class DependencyVersionMerger {
  mergeWithVersions(
    dependencies: ActionDependency[],
    latestVersions: LatestVersion[]
  ): DependencyWithVersion[] {
    const versionMap = new Map<string, string>();
    latestVersions.forEach(version => {
      versionMap.set(`${version.owner}/${version.repo}`, version.latestVersion);
    });

    return dependencies.map(dep => {
      const latestVersion = versionMap.get(`${dep.owner}/${dep.repo}`);
      return {
        ...dep,
        latestVersion,
        isUpToDate: latestVersion ? dep.version === latestVersion : undefined
      };
    });
  }
}
