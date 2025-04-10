"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dependency_version_merger_1 = require("./dependency-version-merger");
describe('DependencyVersionMerger', () => {
    let merger;
    beforeEach(() => {
        merger = new dependency_version_merger_1.DependencyVersionMerger();
    });
    it('should merge dependencies with versions', () => {
        const dependencies = [
            {
                owner: 'actions',
                repo: 'checkout',
                version: 'v3',
                references: [{ filePath: 'workflow1.yml', lineNumber: 1 }]
            }
        ];
        const versions = [
            {
                owner: 'actions',
                repo: 'checkout',
                version: 'v3',
                latestVersion: 'v4',
                currentVersionSha: 'abc123',
                latestVersionSha: 'def456',
                references: [{ filePath: 'workflow1.yml', lineNumber: 1 }],
                isUpToDate: false
            }
        ];
        const result = merger.mergeWithVersions(dependencies, versions);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            latestVersion: 'v4',
            currentVersionSha: 'abc123',
            latestVersionSha: 'def456',
            references: [{ filePath: 'workflow1.yml', lineNumber: 1 }],
            isUpToDate: false
        });
    });
    it('should handle missing version information', () => {
        const dependencies = [
            {
                owner: 'actions',
                repo: 'checkout',
                version: 'v3',
                references: [{ filePath: 'workflow1.yml', lineNumber: 1 }]
            }
        ];
        const versions = [];
        const result = merger.mergeWithVersions(dependencies, versions);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            references: [],
            isUpToDate: undefined
        });
    });
});
