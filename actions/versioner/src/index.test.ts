import { run } from './index';
import * as core from '@actions/core';

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
    await run();

    expect(core.setOutput).toHaveBeenCalledWith('status', 'success');
    expect(core.info).toHaveBeenCalledWith('Found 1 workflow files');
    expect(core.info).toHaveBeenCalledWith('Found 1 action dependencies');
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('update available: v3 (sha-v3) -> v4 (sha-v4)'));
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
