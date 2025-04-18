"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const version_checker_1 = require("./version-checker");
const mockListTags = jest.fn();
const mockGetRef = jest.fn();
const mockGetRepo = jest.fn();
const mockGetBranch = jest.fn();
const mockGetCommit = jest.fn();
jest.mock('@octokit/rest', () => ({
    Octokit: jest.fn().mockImplementation(() => ({
        repos: {
            listTags: mockListTags,
            get: mockGetRepo,
            getBranch: mockGetBranch,
            getCommit: mockGetCommit
        },
        git: {
            getRef: mockGetRef
        }
    }))
}));
describe('VersionChecker', () => {
    let checker;
    const mockToken = 'test-token';
    const mockDependency = {
        owner: 'actions',
        repo: 'checkout',
        version: 'v3',
        references: [{
                filePath: 'workflow.yml',
                lineNumber: 1
            }]
    };
    const branchDependency = {
        owner: 'actions',
        repo: 'checkout',
        version: 'main',
        references: [{
                filePath: 'workflow.yml',
                lineNumber: 2
            }]
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mockListTags.mockResolvedValue({
            data: [
                { name: 'v4.2.2', commit: { sha: 'sha-v4.2.2' } },
                { name: 'v4.2.1', commit: { sha: 'sha-v4.2.1' } },
                { name: 'v4.2.0', commit: { sha: 'sha-v4.2.0' } }
            ]
        });
        mockGetRef.mockImplementation(({ ref }) => {
            if (ref.startsWith('tags/')) {
                const tagName = ref.replace('tags/', '');
                return Promise.resolve({ data: { object: { sha: `sha-${tagName}` } } });
            }
            if (ref.startsWith('heads/')) {
                const branchName = ref.replace('heads/', '');
                return Promise.resolve({ data: { object: { sha: `sha-${branchName}` } } });
            }
            throw new Error('Not Found');
        });
        mockGetCommit.mockImplementation(({ ref }) => {
            const date = new Date();
            if (ref === 'sha-v4.2.2')
                date.setDate(date.getDate() - 7); // 7 days ago
            if (ref === 'sha-v4.2.1')
                date.setDate(date.getDate() - 14); // 14 days ago
            if (ref === 'sha-v4.2.0')
                date.setDate(date.getDate() - 21); // 21 days ago
            if (ref === 'sha-v3')
                date.setDate(date.getDate() - 30); // 30 days ago
            if (ref === 'sha-main')
                date.setDate(date.getDate() - 1); // 1 day ago
            return Promise.resolve({
                data: {
                    sha: ref,
                    commit: {
                        committer: { date: date.toISOString() },
                        author: { date: date.toISOString() }
                    }
                }
            });
        });
        mockGetRepo.mockResolvedValue({ data: { default_branch: 'main' } });
        mockGetBranch.mockResolvedValue({ data: { commit: { sha: 'sha-main' } } });
        checker = new version_checker_1.VersionVerifier(mockToken);
    });
    it('should return highest semver version regardless of commit date', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockResolvedValue({
            data: [
                { name: 'v2.7.2', commit: { sha: 'sha-v2.7.2' } },
                { name: 'v2.8.2', commit: { sha: 'sha-v2.8.2' } },
                { name: 'v2.6.0', commit: { sha: 'sha-v2.6.0' } }
            ]
        });
        const result = yield checker.checkVersion(mockDependency);
        expect(result.latestVersion).toBe('v2.8.2');
        expect(result.latestVersionSha).toBe('sha-v2.8.2');
    }));
    it('should not suggest update if current version is higher', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockResolvedValue({
            data: [
                { name: 'v2.7.2', commit: { sha: 'sha-v2.7.2' } },
                { name: 'v2.8.2', commit: { sha: 'sha-v2.8.2' } },
                { name: 'v2.9.0', commit: { sha: 'sha-v2.9.0' } }
            ]
        });
        const result = yield checker.checkVersion(Object.assign(Object.assign({}, mockDependency), { version: 'v2.9.0' }));
        expect(result.latestVersion).toBe('v2.9.0');
        expect(result.latestVersionSha).toBe('sha-v2.9.0');
    }));
    it('should suggest highest semver when using branch', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield checker.checkVersion(branchDependency);
        expect(result.latestVersion).toBe('v4.2.2');
        expect(result.latestVersionSha).toBe('sha-v4.2.2');
    }));
    it('should handle custom tags when no semver tags exist', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockResolvedValue({
            data: [
                { name: 'stable', commit: { sha: 'sha-stable' } },
                { name: 'latest', commit: { sha: 'sha-latest' } },
                { name: 'v1', commit: { sha: 'sha-v1' } }
            ]
        });
        const result = yield checker.checkVersion(mockDependency);
        expect(result.latestVersion).toBe('latest');
        expect(result.latestVersionSha).toBe('sha-latest');
    }));
    it('should use default branch when no tags exist', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockResolvedValue({ data: [] });
        const result = yield checker.checkVersion(mockDependency);
        expect(result.latestVersion).toBe('main');
        expect(result.latestVersionSha).toBe('sha-main');
    }));
    it('should handle v-prefixed and non-v-prefixed versions', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockResolvedValue({
            data: [
                { name: '1.0.0', commit: { sha: 'sha-1.0.0' } },
                { name: 'v2.0.0', commit: { sha: 'sha-v2.0.0' } },
                { name: 'v1.1.0', commit: { sha: 'sha-v1.1.0' } },
                { name: '1.0.1', commit: { sha: 'sha-1.0.1' } }
            ]
        });
        const result = yield checker.checkVersion(mockDependency);
        expect(result.latestVersion).toBe('v2.0.0');
        expect(result.latestVersionSha).toBe('sha-v2.0.0');
    }));
    it('should handle API errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
        mockGetRef.mockRejectedValue(new Error('API error'));
        mockListTags.mockRejectedValue(new Error('API error'));
        const result = yield checker.checkVersion(mockDependency);
        expect(result).toEqual({
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            latestVersion: 'v3',
            currentVersionSha: 'unknown',
            latestVersionSha: 'unknown',
            references: [{
                    filePath: 'workflow.yml',
                    lineNumber: 1
                }],
            error: 'API error',
            isUpToDate: false
        });
    }));
    it('should handle reference not found errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
        mockGetRef.mockRejectedValue(new Error('Reference not found'));
        mockListTags.mockRejectedValue(new Error('API error'));
        const result = yield checker.checkVersion(mockDependency);
        expect(result).toEqual({
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            latestVersion: 'v3',
            currentVersionSha: 'unknown',
            latestVersionSha: 'unknown',
            references: [{
                    filePath: 'workflow.yml',
                    lineNumber: 1
                }],
            error: 'Reference not found',
            isUpToDate: false
        });
    }));
    it('should show same version when SHA is identical', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockResolvedValue({
            data: [
                { name: 'v4.2.2', commit: { sha: 'same-sha' } },
                { name: 'v4.2.1', commit: { sha: 'sha-v4.2.1' } },
                { name: 'v4.2.0', commit: { sha: 'sha-v4.2.0' } }
            ]
        });
        // Mock the same SHA for both current and latest version
        mockGetRef.mockImplementation(({ ref }) => {
            return Promise.resolve({ data: { object: { sha: 'same-sha' } } });
        });
        mockGetCommit.mockImplementation(({ ref }) => {
            const date = new Date();
            return Promise.resolve({
                data: {
                    sha: 'same-sha',
                    commit: {
                        committer: { date: date.toISOString() },
                        author: { date: date.toISOString() }
                    }
                }
            });
        });
        const result = yield checker.checkVersion(mockDependency);
        expect(result).toEqual({
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            latestVersion: 'v3',
            currentVersionSha: 'same-sha',
            latestVersionSha: 'same-sha',
            references: [{
                    filePath: 'workflow.yml',
                    lineNumber: 1
                }],
            isUpToDate: true
        });
    }));
});
