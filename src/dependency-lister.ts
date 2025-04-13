import { DependencyAnalyzer } from './dependency-analyzer';
import { FileLister, FileListerOptions } from './file-lister';
import { ActionDependency, FileReference } from './types';

export class DependencyLister {
  private dependencyAnalyzer: DependencyAnalyzer;
  private fileLister: FileLister;

  constructor(
    options: FileListerOptions = {},
    dependencyAnalyzer?: DependencyAnalyzer,
    fileLister?: FileLister
  ) {
    this.dependencyAnalyzer = dependencyAnalyzer || new DependencyAnalyzer();
    this.fileLister = fileLister || new FileLister(options);
  }

  listUniqueDependencies(): ActionDependency[] {
    const files = this.fileLister.listWorkflowFiles();
    const allDependencies = files.flatMap(file => this.dependencyAnalyzer.analyzeWorkflowFile(file));
    const uniqueDependencies = new Map<string, ActionDependency>();

    allDependencies.forEach(dependency => {
      const key = `${dependency.owner}/${dependency.repo}@${dependency.version}`;
      if (!uniqueDependencies.has(key)) {
        uniqueDependencies.set(key, {
          owner: dependency.owner,
          repo: dependency.repo,
          version: dependency.version,
          references: dependency.references
        });
      } else {
        const existing = uniqueDependencies.get(key)!;
        existing.references.push(...dependency.references);
      }
    });

    return Array.from(uniqueDependencies.values());
  }
}
