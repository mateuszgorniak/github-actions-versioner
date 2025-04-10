import { DependencyVersionMerger } from './dependency-version-merger';
import { ActionDependency } from './dependency-analyzer';
import { LatestVersion } from './version-checker';

describe('DependencyVersionMerger', () => {
  let merger: DependencyVersionMerger;
  const mockDependencies: ActionDependency[] = [
    {
      owner: 'actions',
      repo: 'checkout',
      version: 'v4',
      lineNumber: 1,
      filePath: 'workflow1.yml'
    },
    {
      owner: 'actions',
      repo: 'setup-node',
      version: 'v3',
      lineNumber: 2,
      filePath: 'workflow1.yml'
    }
  ];

  const mockLatestVersions: LatestVersion[] = [
    {
      owner: 'actions',
      repo: 'checkout',
      latestVersion: 'v4.2.2',
      currentVersionSha: '11bd719',
      latestVersionSha: '11bd719'
    },
    {
      owner: 'actions',
      repo: 'setup-node',
      latestVersion: 'v3',
      currentVersionSha: 'sha-v3',
      latestVersionSha: 'sha-v3'
    }
  ];

  beforeEach(() => {
    merger = new DependencyVersionMerger();
  });

  it('should merge dependencies with their latest versions', () => {
    const result = merger.mergeWithVersions(mockDependencies, mockLatestVersions);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      ...mockDependencies[0],
      latestVersion: 'v4.2.2',
      currentVersionSha: '11bd719',
      latestVersionSha: '11bd719',
      isUpToDate: true
    });
    expect(result[1]).toEqual({
      ...mockDependencies[1],
      latestVersion: 'v3',
      currentVersionSha: 'sha-v3',
      latestVersionSha: 'sha-v3',
      isUpToDate: true
    });
  });

  it('should handle missing latest versions', () => {
    const result = merger.mergeWithVersions(mockDependencies, []);

    expect(result).toHaveLength(2);
    expect(result[0].latestVersion).toBeUndefined();
    expect(result[0].currentVersionSha).toBeUndefined();
    expect(result[0].latestVersionSha).toBeUndefined();
    expect(result[0].isUpToDate).toBeUndefined();
  });
});
