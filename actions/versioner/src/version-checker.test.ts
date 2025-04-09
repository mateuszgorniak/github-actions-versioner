import { VersionChecker } from './version-checker';
import { UniqueDependency } from './dependency-lister';

const mockListTags = jest.fn();

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    repos: {
      listTags: mockListTags
    }
  }))
}));

describe('VersionChecker', () => {
  let checker: VersionChecker;
  const mockToken = 'test-token';
  const mockDependency: UniqueDependency = {
    owner: 'actions',
    repo: 'checkout'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockListTags.mockResolvedValue({
      data: [
        { name: 'v4' },
        { name: 'v3' }
      ]
    });
    checker = new VersionChecker(mockToken);
  });

  it('should check if dependency is up to date', async () => {
    const result = await checker.checkVersion(mockDependency);

    expect(result).toEqual({
      owner: 'actions',
      repo: 'checkout',
      latestVersion: 'v4'
    });

    expect(mockListTags).toHaveBeenCalledWith({
      owner: 'actions',
      repo: 'checkout',
      per_page: 1
    });
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
});
