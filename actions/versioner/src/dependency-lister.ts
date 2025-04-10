import { ActionDependency } from './dependency-analyzer';

export interface UniqueDependency {
  owner: string;
  repo: string;
  version: string;
  references: Array<{
    filePath: string;
    lineNumber: number;
  }>;
}

export class DependencyLister {
  listUniqueDependencies(dependencies: ActionDependency[]): UniqueDependency[] {
    const uniqueMap = new Map<string, UniqueDependency>();

    dependencies.forEach(dep => {
      const key = `${dep.owner}/${dep.repo}/${dep.version}`;
      const existing = uniqueMap.get(key);

      if (existing) {
        existing.references.push({
          filePath: dep.filePath,
          lineNumber: dep.lineNumber
        });
      } else {
        uniqueMap.set(key, {
          owner: dep.owner,
          repo: dep.repo,
          version: dep.version,
          references: [{
            filePath: dep.filePath,
            lineNumber: dep.lineNumber
          }]
        });
      }
    });

    return Array.from(uniqueMap.values());
  }
}
