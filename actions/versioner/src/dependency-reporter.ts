import { DependencyWithVersion } from './dependency-version-merger';

export class DependencyReporter {
  report(dependencies: DependencyWithVersion[]): string {
    const reportLines: string[] = [];

    dependencies.forEach(dep => {
      const status = dep.isUpToDate
        ? '✅ up to date'
        : dep.latestVersion
          ? `⚠️ update available: ${dep.version} (${dep.currentVersionSha?.substring(0, 7)}) -> ${dep.latestVersion} (${dep.latestVersionSha?.substring(0, 7)})`
          : '❌ version check failed';

      reportLines.push(
        `${dep.owner}/${dep.repo}@${dep.version} (${dep.filePath}:${dep.lineNumber}) - ${status}`
      );
    });

    return reportLines.join('\n');
  }
}
