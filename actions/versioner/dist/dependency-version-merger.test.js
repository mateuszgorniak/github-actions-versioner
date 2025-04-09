"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dependency_version_merger_1 = require("./dependency-version-merger");
describe('DependencyVersionMerger', () => {
    let merger;
    const mockDependencies = [
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            lineNumber: 1,
            filePath: 'workflow1.yml'
        },
        {
            owner: 'actions',
            repo: 'setup-node',
            version: 'v3',
            lineNumber: 2,
            filePath: 'workflow1.yml'
        }
    ];
    const mockLatestVersions = [
        {
            owner: 'actions',
            repo: 'checkout',
            latestVersion: 'v4',
            currentVersionSha: 'sha-v3',
            latestVersionSha: 'sha-v4'
        },
        {
            owner: 'actions',
            repo: 'setup-node',
            latestVersion: 'v3',
            currentVersionSha: 'sha-v3',
            latestVersionSha: 'sha-v3'
        }
    ];
    beforeEach(() => {
        merger = new dependency_version_merger_1.DependencyVersionMerger();
    });
    it('should merge dependencies with their latest versions', () => {
        const result = merger.mergeWithVersions(mockDependencies, mockLatestVersions);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(Object.assign(Object.assign({}, mockDependencies[0]), { latestVersion: 'v4', currentVersionSha: 'sha-v3', latestVersionSha: 'sha-v4', isUpToDate: false }));
        expect(result[1]).toEqual(Object.assign(Object.assign({}, mockDependencies[1]), { latestVersion: 'v3', currentVersionSha: 'sha-v3', latestVersionSha: 'sha-v3', isUpToDate: true }));
    });
    it('should handle missing latest versions', () => {
        const result = merger.mergeWithVersions(mockDependencies, []);
        expect(result).toHaveLength(2);
        expect(result[0].latestVersion).toBeUndefined();
        expect(result[0].currentVersionSha).toBeUndefined();
        expect(result[0].latestVersionSha).toBeUndefined();
        expect(result[0].isUpToDate).toBeUndefined();
    });
});
