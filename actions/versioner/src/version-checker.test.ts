import { VersionVerifier } from './version-checker';
import { UniqueDependency } from './types';
import { Octokit } from '@octokit/rest';

const mockListTags = jest.fn();
const mockGetRef = jest.fn();
const mockGetRepo = jest.fn();
const mockGetBranch = jest.fn();
const mockGetCommit = jest.fn();

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    repos: {
      listTags: mockListTags,
      get: mockGetRepo,
      getBranch: mockGetBranch,
      getCommit: mockGetCommit
    },
    git: {
      getRef: mockGetRef
    }
  }))
}));

describe('VersionChecker', () => {
  let checker: VersionVerifier;
  const mockToken = 'test-token';

  const mockDependency: UniqueDependency = {
    owner: 'actions',
    repo: 'checkout',
    version: 'v3',
    references: [{
      filePath: 'workflow.yml',
      lineNumber: 1
    }]
  };

  const branchDependency: UniqueDependency = {
    owner: 'actions',
    repo: 'checkout',
    version: 'main',
    references: [{
      filePath: 'workflow.yml',
      lineNumber: 2
    }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockListTags.mockResolvedValue({
      data: [
        { name: 'v4.2.2', commit: { sha: 'sha-v4.2.2' } },
        { name: 'v4.2.1', commit: { sha: 'sha-v4.2.1' } },
        { name: 'v4.2.0', commit: { sha: 'sha-v4.2.0' } }
      ]
    });
    mockGetRef.mockImplementation(({ ref }) => {
      if (ref.startsWith('tags/')) {
        const tagName = ref.replace('tags/', '');
        return Promise.resolve({ data: { object: { sha: `sha-${tagName}` } } });
      }
      if (ref.startsWith('heads/')) {
        const branchName = ref.replace('heads/', '');
        return Promise.resolve({ data: { object: { sha: `sha-${branchName}` } } });
      }
      throw new Error('Not Found');
    });
    mockGetCommit.mockImplementation(({ ref }) => {
      const date = new Date();
      if (ref === 'sha-v4.2.2') date.setDate(date.getDate() - 7); // 7 days ago
      if (ref === 'sha-v4.2.1') date.setDate(date.getDate() - 14); // 14 days ago
      if (ref === 'sha-v4.2.0') date.setDate(date.getDate() - 21); // 21 days ago
      if (ref === 'sha-v3') date.setDate(date.getDate() - 30); // 30 days ago
      if (ref === 'sha-main') date.setDate(date.getDate() - 1); // 1 day ago
      return Promise.resolve({
        data: {
          sha: ref,
          commit: {
            committer: { date: date.toISOString() },
            author: { date: date.toISOString() }
          }
        }
      });
    });
    mockGetRepo.mockResolvedValue({ data: { default_branch: 'main' } });
    mockGetBranch.mockResolvedValue({ data: { commit: { sha: 'sha-main' } } });
    checker = new VersionVerifier(mockToken);
  });

  it('should return highest semver version regardless of commit date', async () => {
    mockListTags.mockResolvedValue({
      data: [
        { name: 'v2.7.2', commit: { sha: 'sha-v2.7.2' } },
        { name: 'v2.8.2', commit: { sha: 'sha-v2.8.2' } },
        { name: 'v2.6.0', commit: { sha: 'sha-v2.6.0' } }
      ]
    });

    const result = await checker.checkVersion(mockDependency);

    expect(result.latestVersion).toBe('v2.8.2');
    expect(result.latestVersionSha).toBe('sha-v2.8.2');
  });

  it('should not suggest update if current version is higher', async () => {
    mockListTags.mockResolvedValue({
      data: [
        { name: 'v2.7.2', commit: { sha: 'sha-v2.7.2' } },
        { name: 'v2.8.2', commit: { sha: 'sha-v2.8.2' } },
        { name: 'v2.9.0', commit: { sha: 'sha-v2.9.0' } }
      ]
    });

    const result = await checker.checkVersion({
      ...mockDependency,
      version: 'v2.9.0'
    });

    expect(result.latestVersion).toBe('v2.9.0');
    expect(result.latestVersionSha).toBe('sha-v2.9.0');
  });

  it('should suggest highest semver when using branch', async () => {
    const result = await checker.checkVersion(branchDependency);

    expect(result.latestVersion).toBe('v4.2.2');
    expect(result.latestVersionSha).toBe('sha-v4.2.2');
  });

  it('should handle custom tags when no semver tags exist', async () => {
    mockListTags.mockResolvedValue({
      data: [
        { name: 'stable', commit: { sha: 'sha-stable' } },
        { name: 'latest', commit: { sha: 'sha-latest' } },
        { name: 'v1', commit: { sha: 'sha-v1' } }
      ]
    });

    const result = await checker.checkVersion(mockDependency);

    expect(result.latestVersion).toBe('latest');
    expect(result.latestVersionSha).toBe('sha-latest');
  });

  it('should use default branch when no tags exist', async () => {
    mockListTags.mockResolvedValue({ data: [] });

    const result = await checker.checkVersion(mockDependency);

    expect(result.latestVersion).toBe('main');
    expect(result.latestVersionSha).toBe('sha-main');
  });

  it('should handle v-prefixed and non-v-prefixed versions', async () => {
    mockListTags.mockResolvedValue({
      data: [
        { name: '1.0.0', commit: { sha: 'sha-1.0.0' } },
        { name: 'v2.0.0', commit: { sha: 'sha-v2.0.0' } },
        { name: 'v1.1.0', commit: { sha: 'sha-v1.1.0' } },
        { name: '1.0.1', commit: { sha: 'sha-1.0.1' } }
      ]
    });

    const result = await checker.checkVersion(mockDependency);

    expect(result.latestVersion).toBe('v2.0.0');
    expect(result.latestVersionSha).toBe('sha-v2.0.0');
  });

  it('should handle API errors gracefully', async () => {
    mockGetRef.mockRejectedValue(new Error('API error'));
    mockListTags.mockRejectedValue(new Error('API error'));

    const result = await checker.checkVersion(mockDependency);

    expect(result).toEqual({
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      latestVersion: 'v3',
      currentVersionSha: 'unknown',
      latestVersionSha: 'unknown',
      references: [{
        filePath: 'workflow.yml',
        lineNumber: 1
      }],
      error: 'API error',
      isUpToDate: false
    });
  });

  it('should handle reference not found errors gracefully', async () => {
    mockGetRef.mockRejectedValue(new Error('Reference not found'));
    mockListTags.mockRejectedValue(new Error('API error'));

    const result = await checker.checkVersion(mockDependency);

    expect(result).toEqual({
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      latestVersion: 'v3',
      currentVersionSha: 'unknown',
      latestVersionSha: 'unknown',
      references: [{
        filePath: 'workflow.yml',
        lineNumber: 1
      }],
      error: 'Reference not found',
      isUpToDate: false
    });
  });
});
