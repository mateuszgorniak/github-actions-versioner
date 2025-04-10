"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dependency_reporter_1 = require("./dependency-reporter");
describe('DependencyReporter', () => {
    let reporter;
    const mockDependencies = [
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            latestVersion: 'v4',
            currentVersionSha: 'abcdef1234567890',
            latestVersionSha: 'fedcba0987654321',
            isUpToDate: false,
            lineNumber: 1,
            filePath: 'workflow1.yml'
        },
        {
            owner: 'actions',
            repo: 'setup-node',
            version: 'v3',
            latestVersion: 'v3',
            currentVersionSha: 'abcdef1234567890',
            latestVersionSha: 'abcdef1234567890',
            isUpToDate: true,
            lineNumber: 2,
            filePath: 'workflow1.yml'
        },
        {
            owner: 'actions',
            repo: 'setup-python',
            version: 'v3',
            lineNumber: 3,
            filePath: 'workflow1.yml'
        },
        {
            owner: 'actions',
            repo: 'setup-java',
            version: 'v3',
            latestVersion: 'v4',
            currentVersionSha: 'abcdef1234567890',
            latestVersionSha: 'fedcba0987654321',
            isUpToDate: undefined,
            lineNumber: 4,
            filePath: 'workflow1.yml'
        }
    ];
    beforeEach(() => {
        reporter = new dependency_reporter_1.DependencyReporter();
    });
    it('should generate report for dependencies', () => {
        const report = reporter.report(mockDependencies);
        expect(report).toContain('actions/checkout@v3 (workflow1.yml:1) - ⚠️ update available: v3 (abcdef1) -> v4 (fedcba0)');
        expect(report).toContain('actions/setup-node@v3 (workflow1.yml:2) - ✅ up to date');
        expect(report).toContain('actions/setup-python@v3 (workflow1.yml:3) - ❌ version check failed - could not compare versions');
        expect(report).toContain('actions/setup-java@v3 (workflow1.yml:4) - ❌ version check failed - could not compare versions');
    });
    it('should handle empty array', () => {
        const report = reporter.report([]);
        expect(report).toBe('');
    });
});
