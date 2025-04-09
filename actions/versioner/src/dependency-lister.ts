import { ActionDependency } from './dependency-analyzer';

export interface UniqueDependency {
  owner: string;
  repo: string;
}

export class DependencyLister {
  listUniqueDependencies(dependencies: ActionDependency[]): UniqueDependency[] {
    const uniqueDeps = new Set<string>();
    const unique: UniqueDependency[] = [];

    for (const dep of dependencies) {
      const key = `${dep.owner}/${dep.repo}`;
      if (!uniqueDeps.has(key)) {
        uniqueDeps.add(key);
        unique.push({
          owner: dep.owner,
          repo: dep.repo
        });
      }
    }

    return unique;
  }
}
