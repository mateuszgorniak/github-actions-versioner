import { DependencyReporter } from './dependency-reporter';
import { DependencyWithVersion } from './dependency-version-merger';

describe('DependencyReporter', () => {
  let reporter: DependencyReporter;
  const mockDependencies: DependencyWithVersion[] = [
    {
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      latestVersion: 'v4',
      isUpToDate: false,
      lineNumber: 1,
      filePath: 'workflow1.yml'
    },
    {
      owner: 'actions',
      repo: 'setup-node',
      version: 'v3',
      latestVersion: 'v3',
      isUpToDate: true,
      lineNumber: 2,
      filePath: 'workflow1.yml'
    },
    {
      owner: 'actions',
      repo: 'cache',
      version: 'v2',
      latestVersion: undefined,
      isUpToDate: undefined,
      lineNumber: 3,
      filePath: 'workflow1.yml'
    }
  ];

  beforeEach(() => {
    reporter = new DependencyReporter();
  });

  it('should generate correct report', () => {
    const report = reporter.report(mockDependencies);

    expect(report).toContain('actions/checkout@v3 (workflow1.yml:1) - ⚠️ update available: v3 -> v4');
    expect(report).toContain('actions/setup-node@v3 (workflow1.yml:2) - ✅ up to date');
    expect(report).toContain('actions/cache@v2 (workflow1.yml:3) - ❌ version check failed');
  });

  it('should handle empty array', () => {
    const report = reporter.report([]);
    expect(report).toBe('');
  });
});
