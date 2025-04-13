import { run } from './index';
import * as core from '@actions/core';
import { FileLister } from './file-lister';
import { DependencyAnalyzer } from './dependency-analyzer';
import { DependencyLister } from './dependency-lister';
import { VersionVerifier } from './version-checker';
import { DependencyVersionMerger } from './dependency-version-merger';
import { DependencyReporter } from './dependency-reporter';
import { ActionDependency } from './types';

// Mock @actions/core
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  setFailed: jest.fn()
}));

// Mock @octokit/rest
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    repos: {
      listTags: jest.fn().mockResolvedValue({
        data: [{ name: 'v4' }]
      })
    },
    git: {
      getRef: jest.fn().mockImplementation(({ ref }) => {
        const sha = ref === 'tags/v4' ? 'sha-v4' : 'sha-v3';
        return Promise.resolve({ data: { object: { sha } } });
      })
    }
  }))
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readdirSync: jest.fn().mockReturnValue(['workflow.yml']),
  readFileSync: jest.fn().mockReturnValue(`
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
  `)
}));

describe('GitHub Actions Versioner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (core.getInput as jest.Mock).mockImplementation((name: string) => {
      switch (name) {
        case 'token':
          return 'test-token';
        case 'workflow_path':
          return '.github/workflows';
        default:
          return '';
      }
    });
  });

  it('should run without errors', async () => {
    const mockToken = 'test-token';
    const mockWorkflowPath = '.github/workflows';
    const mockWorkflowFiles = ['test.yml'];
    const mockDependencies = [{
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      filePath: 'test.yml',
      lineNumber: 1,
      references: [{
        filePath: 'test.yml',
        lineNumber: 1
      }]
    }];
    const mockUniqueDependencies = [{
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      filePath: 'test.yml',
      lineNumber: 1,
      references: [{
        filePath: 'test.yml',
        lineNumber: 1
      }]
    }];
    const mockLatestVersions = [{
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      latestVersion: 'v4',
      currentVersionSha: 'sha-v3',
      latestVersionSha: 'sha-v4',
      filePath: 'test.yml',
      lineNumber: 1,
      references: [{
        filePath: 'test.yml',
        lineNumber: 1
      }],
      isUpToDate: false
    }];
    const mockDependenciesWithVersions = [{
      ...mockDependencies[0],
      latestVersion: 'v4',
      currentVersionSha: 'sha-v3',
      latestVersionSha: 'sha-v4',
      isUpToDate: false
    }];

    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'token') return mockToken;
      if (name === 'workflow_path') return mockWorkflowPath;
      return '';
    });

    jest.spyOn(FileLister.prototype, 'listWorkflowFiles').mockReturnValue(mockWorkflowFiles);
    jest.spyOn(DependencyAnalyzer.prototype, 'analyzeWorkflowFile').mockReturnValue(mockDependencies);
    jest.spyOn(DependencyLister.prototype, 'listUniqueDependencies').mockReturnValue(mockUniqueDependencies);
    jest.spyOn(VersionVerifier.prototype, 'checkVersion').mockResolvedValue(mockLatestVersions[0]);
    jest.spyOn(DependencyVersionMerger.prototype, 'mergeWithVersions').mockReturnValue(mockDependenciesWithVersions);
    jest.spyOn(DependencyReporter.prototype, 'report').mockReturnValue('test report');

    await run();

    expect(core.info).toHaveBeenCalledWith('Found 1 workflow files');
    expect(core.info).toHaveBeenCalledWith('Found 1 action dependencies');
    expect(core.info).toHaveBeenCalledWith('Found 1 unique action dependencies');
    expect(core.info).toHaveBeenCalledWith('\nDependency Report:');
    expect(core.info).toHaveBeenCalledWith('test report');
    expect(core.warning).toHaveBeenCalledWith('Found 1 outdated actions');
    expect(core.setOutput).toHaveBeenCalledWith('outdated_actions', JSON.stringify(mockDependenciesWithVersions));
    expect(core.setOutput).toHaveBeenCalledWith('status', 'success');
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Test error');
    (core.getInput as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(error.message);
  });
});

describe('index', () => {
  it('should list unique dependencies', () => {
    const lister = new DependencyLister();
    const uniqueDependencies = lister.listUniqueDependencies();
    expect(uniqueDependencies).toBeDefined();
  });
});
