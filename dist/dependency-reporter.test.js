"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dependency_reporter_1 = require("./dependency-reporter");
describe('DependencyReporter', () => {
    let reporter;
    beforeEach(() => {
        reporter = new dependency_reporter_1.DependencyReporter();
    });
    it('should generate report for up-to-date dependencies', () => {
        const dependencies = [{
                owner: 'actions',
                repo: 'checkout',
                version: 'v3',
                references: [{
                        filePath: 'workflow.yml',
                        lineNumber: 1
                    }],
                latestVersion: 'v3',
                currentVersionSha: 'abcdef1234567890',
                latestVersionSha: 'abcdef1234567890',
                isUpToDate: true
            }];
        const report = reporter.report(dependencies);
        expect(report).toBe('actions/checkout@v3 (workflow.yml:1) - ✅ up to date');
    });
    it('should generate report for outdated dependencies', () => {
        const dependencies = [{
                owner: 'actions',
                repo: 'checkout',
                version: 'v3',
                references: [{
                        filePath: 'workflow.yml',
                        lineNumber: 1
                    }],
                latestVersion: 'v4',
                currentVersionSha: 'abcdef1234567890',
                latestVersionSha: 'fedcba0987654321',
                isUpToDate: false
            }];
        const report = reporter.report(dependencies);
        expect(report).toBe('actions/checkout@v3 (workflow.yml:1) - ⚠️ update available: v3 (abcdef1) -> v4 (fedcba0)');
    });
    it('should generate report for dependencies with errors', () => {
        const dependencies = [{
                owner: 'actions',
                repo: 'checkout',
                version: 'v3',
                references: [{
                        filePath: 'workflow.yml',
                        lineNumber: 1
                    }],
                latestVersion: 'v3',
                currentVersionSha: 'unknown',
                latestVersionSha: 'unknown',
                isUpToDate: false,
                error: 'Reference not found'
            }];
        const report = reporter.report(dependencies);
        expect(report).toBe('actions/checkout@v3 (workflow.yml:1) - ❌ error: Reference not found');
    });
    it('should handle multiple dependencies', () => {
        const dependencies = [
            {
                owner: 'actions',
                repo: 'checkout',
                version: 'v3',
                references: [{
                        filePath: 'workflow.yml',
                        lineNumber: 1
                    }],
                latestVersion: 'v3',
                currentVersionSha: 'abcdef1234567890',
                latestVersionSha: 'abcdef1234567890',
                isUpToDate: true
            },
            {
                owner: 'actions',
                repo: 'setup-node',
                version: 'v2',
                references: [{
                        filePath: 'workflow.yml',
                        lineNumber: 2
                    }],
                latestVersion: 'v3',
                currentVersionSha: 'abcdef1234567890',
                latestVersionSha: 'fedcba0987654321',
                isUpToDate: false
            },
            {
                owner: 'actions',
                repo: 'upload-artifact',
                version: 'v1',
                references: [{
                        filePath: 'workflow.yml',
                        lineNumber: 3
                    }],
                latestVersion: 'v1',
                currentVersionSha: 'unknown',
                latestVersionSha: 'unknown',
                isUpToDate: false,
                error: 'API Error'
            }
        ];
        const report = reporter.report(dependencies);
        expect(report).toBe('actions/checkout@v3 (workflow.yml:1) - ✅ up to date\n' +
            'actions/setup-node@v2 (workflow.yml:2) - ⚠️ update available: v2 (abcdef1) -> v3 (fedcba0)\n' +
            'actions/upload-artifact@v1 (workflow.yml:3) - ❌ error: API Error');
    });
});
