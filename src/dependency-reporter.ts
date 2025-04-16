import { DependencyWithVersion } from './dependency-version-merger';

export class DependencyReporter {
  public report(dependencies: DependencyWithVersion[]): string {
    if (dependencies.length === 0) {
      return 'No dependencies found';
    }

    return dependencies.map(dep => this.formatDependency(dep)).join('\n');
  }

  private formatDependency(dep: DependencyWithVersion): string {
    let status = '';
    if (dep.error) {
      status = `❌ error: ${dep.error}`;
    } else if (dep.isUpToDate) {
      status = '✅ up to date';
    } else {
      const currentSha = dep.currentVersionSha?.substring(0, 7) || 'unknown';
      const latestSha = dep.latestVersionSha?.substring(0, 7) || 'unknown';
      status = `⚠️ update available: ${dep.version} (${currentSha}) -> ${dep.latestVersion} (${latestSha})`;
    }

    const reference = dep.references[0] || { filePath: 'unknown', lineNumber: 0 };
    return `${dep.owner}/${dep.repo}@${dep.version} (${reference.filePath}:${reference.lineNumber}) - ${status}`;
  }
}
