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
jest.mock('@octokit/rest', () => ({
    Octokit: jest.fn().mockImplementation(() => ({
        repos: {
            listTags: mockListTags
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
    const dependencyWithoutVersion = {
        owner: 'actions',
        repo: 'checkout',
        version: 'main',
        references: [{
                filePath: 'workflow.yml',
                lineNumber: 3
            }]
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mockListTags.mockResolvedValue({
            data: [{ name: 'v4.2.2' }]
        });
        mockGetRef.mockImplementation(({ ref }) => {
            if (ref === 'tags/v4.2.2')
                return Promise.resolve({ data: { object: { sha: 'sha-v4.2.2' } } });
            if (ref === 'tags/v3')
                return Promise.resolve({ data: { object: { sha: 'sha-v3' } } });
            if (ref === 'heads/main')
                return Promise.resolve({ data: { object: { sha: 'sha-main' } } });
            throw new Error('Not Found');
        });
        checker = new version_checker_1.VersionChecker(mockToken);
    });
    it('should check version for a tag', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield checker.checkVersion(mockDependency);
        expect(result).toEqual({
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            latestVersion: 'v4.2.2',
            currentVersionSha: 'sha-v3',
            latestVersionSha: 'sha-v4.2.2',
            references: [{
                    filePath: 'workflow.yml',
                    lineNumber: 1
                }]
        });
        expect(mockListTags).toHaveBeenCalledWith({
            owner: 'actions',
            repo: 'checkout',
            per_page: 1,
            sort: 'created',
            direction: 'desc'
        });
        expect(mockGetRef).toHaveBeenCalledWith({
            owner: 'actions',
            repo: 'checkout',
            ref: 'tags/v4.2.2'
        });
        expect(mockGetRef).toHaveBeenCalledWith({
            owner: 'actions',
            repo: 'checkout',
            ref: 'tags/v3'
        });
    }));
    it('should check version for a branch', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield checker.checkVersion(branchDependency);
        expect(result).toEqual({
            owner: 'actions',
            repo: 'checkout',
            version: 'main',
            latestVersion: 'v4.2.2',
            currentVersionSha: 'sha-main',
            latestVersionSha: 'sha-v4.2.2',
            references: [{
                    filePath: 'workflow.yml',
                    lineNumber: 2
                }]
        });
        expect(mockGetRef).toHaveBeenCalledWith({
            owner: 'actions',
            repo: 'checkout',
            ref: 'heads/main'
        });
    }));
    it('should handle missing tags', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockResolvedValue({ data: [] });
        yield expect(checker.checkVersion(dependencyWithoutVersion)).rejects.toThrow('No tags found');
    }));
    it('should throw error when API call fails', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockRejectedValue(new Error('API Error'));
        yield expect(checker.checkVersion(mockDependency)).rejects.toThrow('Failed to check version for actions/checkout: Error: API Error');
    }));
    it('should throw error when getting ref fails', () => __awaiter(void 0, void 0, void 0, function* () {
        mockGetRef.mockRejectedValue(new Error('Ref Error'));
        yield expect(checker.checkVersion(mockDependency)).rejects.toThrow('Failed to check version for actions/checkout: Error: Ref Error');
    }));
    it('should handle multiple tags and pick the most recent one', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockResolvedValue({
            data: [
                { name: 'v4.2.2', created_at: '2024-03-01T00:00:00Z' },
                { name: 'v4.2.1', created_at: '2024-02-01T00:00:00Z' },
                { name: 'v4.2.0', created_at: '2024-01-01T00:00:00Z' }
            ]
        });
        const result = yield checker.checkVersion(mockDependency);
        expect(result.latestVersion).toBe('v4.2.2');
        expect(mockListTags).toHaveBeenCalledWith({
            owner: 'actions',
            repo: 'checkout',
            per_page: 1,
            sort: 'created',
            direction: 'desc'
        });
    }));
});
