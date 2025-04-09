import { VersionChecker } from './version-checker';
import { UniqueDependency } from './dependency-lister';

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
    version: 'v3'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockListTags.mockResolvedValue({
      data: [
        { name: 'v4' }
      ]
    });
    mockGetRef.mockImplementation(({ ref }) => {
      if (ref === 'tags/v4') return Promise.resolve({ data: { object: { sha: 'sha-v4' } } });
      if (ref === 'tags/v3') return Promise.resolve({ data: { object: { sha: 'sha-v3' } } });
      if (ref === 'heads/main') return Promise.resolve({ data: { object: { sha: 'sha-main' } } });
      throw new Error('Not Found');
    });
    checker = new VersionChecker(mockToken);
  });

  it('should check if dependency is up to date', async () => {
    const result = await checker.checkVersion(mockDependency);

    expect(result).toEqual({
      owner: 'actions',
      repo: 'checkout',
      latestVersion: 'v4',
      currentVersionSha: 'sha-v3',
      latestVersionSha: 'sha-v4'
    });

    expect(mockListTags).toHaveBeenCalledWith({
      owner: 'actions',
      repo: 'checkout',
      per_page: 1
    });

    expect(mockGetRef).toHaveBeenCalledWith({
      owner: 'actions',
      repo: 'checkout',
      ref: 'tags/v4'
    });

    expect(mockGetRef).toHaveBeenCalledWith({
      owner: 'actions',
      repo: 'checkout',
      ref: 'tags/v3'
    });
  });

  it('should handle branch references', async () => {
    const branchDependency: UniqueDependency = {
      owner: 'actions',
      repo: 'checkout',
      version: 'main'
    };

    const result = await checker.checkVersion(branchDependency);

    expect(result).toEqual({
      owner: 'actions',
      repo: 'checkout',
      latestVersion: 'v4',
      currentVersionSha: 'sha-main',
      latestVersionSha: 'sha-v4'
    });

    expect(mockGetRef).toHaveBeenCalledWith({
      owner: 'actions',
      repo: 'checkout',
      ref: 'heads/main'
    });
  });

  it('should handle dependency without version', async () => {
    const dependencyWithoutVersion: UniqueDependency = {
      owner: 'actions',
      repo: 'checkout'
    };

    const result = await checker.checkVersion(dependencyWithoutVersion);

    expect(result).toEqual({
      owner: 'actions',
      repo: 'checkout',
      latestVersion: 'v4',
      latestVersionSha: 'sha-v4'
    });

    expect(mockGetRef).toHaveBeenCalledTimes(1);
  });

  it('should throw error when API call fails', async () => {
    mockListTags.mockRejectedValue(new Error('API Error'));

    await expect(checker.checkVersion(mockDependency)).rejects.toThrow(
      'Failed to check version for actions/checkout: Error: API Error'
    );
  });

  it('should throw error when no tags are found', async () => {
    mockListTags.mockResolvedValue({ data: [] });

    await expect(checker.checkVersion(mockDependency)).rejects.toThrow(
      'No tags found'
    );
  });

  it('should throw error when getting ref fails', async () => {
    mockGetRef.mockRejectedValue(new Error('Ref Error'));

    await expect(checker.checkVersion(mockDependency)).rejects.toThrow(
      'Failed to check version for actions/checkout: Error: Failed to get SHA for ref v4: Error: Ref Error'
    );
  });
});
