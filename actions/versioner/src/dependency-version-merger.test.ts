import { DependencyVersionMerger } from './dependency-version-merger';
import { ActionDependency } from './types';
import { LatestVersion } from './version-checker';

describe('DependencyVersionMerger', () => {
  let merger: DependencyVersionMerger;

  beforeEach(() => {
    merger = new DependencyVersionMerger();
  });

  it('should merge dependencies with versions', () => {
    const dependencies: ActionDependency[] = [
      {
        owner: 'actions',
        repo: 'checkout',
        version: 'v3',
        references: [{ filePath: 'workflow1.yml', lineNumber: 1 }]
      }
    ];

    const versions: LatestVersion[] = [
      {
        owner: 'actions',
        repo: 'checkout',
        version: 'v3',
        latestVersion: 'v4',
        currentVersionSha: 'abc123',
        latestVersionSha: 'def456',
        references: [{ filePath: 'workflow1.yml', lineNumber: 1 }],
        isUpToDate: false
      }
    ];

    const result = merger.mergeWithVersions(dependencies, versions);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      latestVersion: 'v4',
      currentVersionSha: 'abc123',
      latestVersionSha: 'def456',
      references: [{ filePath: 'workflow1.yml', lineNumber: 1 }],
      isUpToDate: false
    });
  });

  it('should handle missing version information', () => {
    const dependencies: ActionDependency[] = [
      {
        owner: 'actions',
        repo: 'checkout',
        version: 'v3',
        references: [{ filePath: 'workflow1.yml', lineNumber: 1 }]
      }
    ];

    const versions: LatestVersion[] = [];

    const result = merger.mergeWithVersions(dependencies, versions);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      references: [],
      isUpToDate: undefined
    });
  });
});
