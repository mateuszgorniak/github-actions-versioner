import { VersionChecker } from './version-checker';
import { UniqueDependency } from './dependency-lister';
import { Octokit } from '@octokit/rest';

const mockListTags = jest.fn();
const mockGetRef = jest.fn();

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    repos: {
      listTags: mockListTags
    },
    git: {
      getRef: mockGetRef
    }
  }))
}));

describe('VersionChecker', () => {
  let checker: VersionChecker;
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

  const dependencyWithoutVersion: UniqueDependency = {
    owner: 'actions',
    repo: 'checkout',
    version: 'main',
    references: [{
      filePath: 'workflow.yml',
      lineNumber: 3
    }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockListTags.mockResolvedValue({
      data: [{ name: 'v4.2.2' }]
    });
    mockGetRef.mockImplementation(({ ref }) => {
      if (ref === 'tags/v4.2.2') return Promise.resolve({ data: { object: { sha: 'sha-v4.2.2' } } });
      if (ref === 'tags/v3') return Promise.resolve({ data: { object: { sha: 'sha-v3' } } });
      if (ref === 'heads/main') return Promise.resolve({ data: { object: { sha: 'sha-main' } } });
      throw new Error('Not Found');
    });
    checker = new VersionChecker(mockToken);
  });

  it('should check version for a tag', async () => {
    const result = await checker.checkVersion(mockDependency);

    expect(result).toEqual({
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      latestVersion: 'v4.2.2',
      currentVersionSha: 'sha-v3',
      latestVersionSha: 'sha-v4.2.2',
      references: [{
        filePath: 'workflow.yml',
        lineNumber: 1
      }]
    });

    expect(mockListTags).toHaveBeenCalledWith({
      owner: 'actions',
      repo: 'checkout',
      per_page: 1
    });

    expect(mockGetRef).toHaveBeenCalledWith({
      owner: 'actions',
      repo: 'checkout',
      ref: 'tags/v4.2.2'
    });

    expect(mockGetRef).toHaveBeenCalledWith({
      owner: 'actions',
      repo: 'checkout',
      ref: 'tags/v3'
    });
  });

  it('should check version for a branch', async () => {
    const result = await checker.checkVersion(branchDependency);

    expect(result).toEqual({
      owner: 'actions',
      repo: 'checkout',
      version: 'main',
      latestVersion: 'v4.2.2',
      currentVersionSha: 'sha-main',
      latestVersionSha: 'sha-v4.2.2',
      references: [{
        filePath: 'workflow.yml',
        lineNumber: 2
      }]
    });

    expect(mockGetRef).toHaveBeenCalledWith({
      owner: 'actions',
      repo: 'checkout',
      ref: 'heads/main'
    });
  });

  it('should handle missing tags', async () => {
    mockListTags.mockResolvedValue({ data: [] });

    await expect(checker.checkVersion(dependencyWithoutVersion)).rejects.toThrow(
      'No tags found'
    );
  });

  it('should throw error when API call fails', async () => {
    mockListTags.mockRejectedValue(new Error('API Error'));

    await expect(checker.checkVersion(mockDependency)).rejects.toThrow(
      'Failed to check version for actions/checkout: Error: API Error'
    );
  });

  it('should throw error when getting ref fails', async () => {
    mockGetRef.mockRejectedValue(new Error('Ref Error'));

    await expect(checker.checkVersion(mockDependency)).rejects.toThrow(
      'Failed to check version for actions/checkout: Error: Ref Error'
    );
  });
});
