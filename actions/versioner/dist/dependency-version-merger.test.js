"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dependency_version_merger_1 = require("./dependency-version-merger");
describe('DependencyVersionMerger', () => {
    let merger;
    const mockDependencies = [
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v4',
            lineNumber: 1,
            filePath: 'workflow1.yml'
        },
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            lineNumber: 2,
            filePath: 'workflow2.yml'
        },
        {
            owner: 'actions',
            repo: 'setup-node',
            version: 'v3',
            lineNumber: 3,
            filePath: 'workflow1.yml'
        }
    ];
    const mockLatestVersions = [
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v4',
            latestVersion: 'v4.2.2',
            currentVersionSha: 'sha-v4',
            latestVersionSha: 'sha-v4.2.2',
            references: [{
                    filePath: 'workflow1.yml',
                    lineNumber: 1
                }]
        },
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            latestVersion: 'v4.2.2',
            currentVersionSha: 'sha-v3',
            latestVersionSha: 'sha-v4.2.2',
            references: [{
                    filePath: 'workflow2.yml',
                    lineNumber: 2
                }]
        },
        {
            owner: 'actions',
            repo: 'setup-node',
            version: 'v3',
            latestVersion: 'v3',
            currentVersionSha: 'sha-v3',
            latestVersionSha: 'sha-v3',
            references: [{
                    filePath: 'workflow1.yml',
                    lineNumber: 3
                }]
        }
    ];
    beforeEach(() => {
        merger = new dependency_version_merger_1.DependencyVersionMerger();
    });
    it('should merge dependencies with their latest versions', () => {
        const result = merger.mergeWithVersions(mockDependencies, mockLatestVersions);
        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(Object.assign(Object.assign({}, mockDependencies[0]), { latestVersion: 'v4.2.2', currentVersionSha: 'sha-v4', latestVersionSha: 'sha-v4.2.2', isUpToDate: false }));
        expect(result[1]).toEqual(Object.assign(Object.assign({}, mockDependencies[1]), { latestVersion: 'v4.2.2', currentVersionSha: 'sha-v3', latestVersionSha: 'sha-v4.2.2', isUpToDate: false }));
        expect(result[2]).toEqual(Object.assign(Object.assign({}, mockDependencies[2]), { latestVersion: 'v3', currentVersionSha: 'sha-v3', latestVersionSha: 'sha-v3', isUpToDate: true }));
    });
    it('should handle missing latest versions', () => {
        const result = merger.mergeWithVersions(mockDependencies, []);
        expect(result).toHaveLength(3);
        expect(result[0].latestVersion).toBeUndefined();
        expect(result[0].currentVersionSha).toBeUndefined();
        expect(result[0].latestVersionSha).toBeUndefined();
        expect(result[0].isUpToDate).toBeUndefined();
    });
});
