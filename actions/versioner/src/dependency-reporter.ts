import { DependencyWithVersion } from './dependency-version-merger';

export class DependencyReporter {
  public report(dependencies: DependencyWithVersion[]): string {
    const lines: string[] = [];

    dependencies.forEach(dep => {
      const currentVersion = dep.version;
      const latestVersion = dep.latestVersion;
      const currentSha = dep.currentVersionSha?.substring(0, 7) || 'unknown';
      const latestSha = dep.latestVersionSha?.substring(0, 7) || 'unknown';

      let status = '';
      if (dep.error) {
        status = `⚠️ error: ${dep.error}`;
      } else if (dep.isUpToDate) {
        status = '✅ up to date';
      } else {
        status = `⚠️ update available: ${currentVersion} (${currentSha}) -> ${latestVersion} (${latestSha})`;
      }

      const line = `${dep.owner}/${dep.repo}@${dep.version} (${dep.filePath}:${dep.lineNumber}) - ${status}`;
      lines.push(line);
    });

    return lines.join('\n');
  }
}
