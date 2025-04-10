import { DependencyWithVersion } from './dependency-version-merger';

export class DependencyReporter {
  report(dependencies: DependencyWithVersion[]): string {
    const reportLines: string[] = [];

    dependencies.forEach(dep => {
      let status: string;
      if (dep.isUpToDate === undefined) {
        status = '❌ version check failed - could not compare versions';
      } else if (dep.isUpToDate) {
        status = '✅ up to date';
      } else {
        status = `⚠️ update available: ${dep.version} (${dep.currentVersionSha?.substring(0, 7)}) -> ${dep.latestVersion} (${dep.latestVersionSha?.substring(0, 7)})`;
      }

      reportLines.push(
        `${dep.owner}/${dep.repo}@${dep.version} (${dep.filePath}:${dep.lineNumber}) - ${status}`
      );
    });

    return reportLines.join('\n');
  }
}
