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
        version: 'v3'
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mockListTags.mockResolvedValue({
            data: [
                { name: 'v4' }
            ]
        });
        mockGetRef.mockImplementation(({ ref }) => {
            const sha = ref === 'tags/v4' ? 'sha-v4' : 'sha-v3';
            return Promise.resolve({ data: { object: { sha } } });
        });
        checker = new version_checker_1.VersionChecker(mockToken);
    });
    it('should check if dependency is up to date', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield checker.checkVersion(mockDependency);
        expect(result).toEqual({
            owner: 'actions',
            repo: 'checkout',
            latestVersion: 'v4',
            currentVersionSha: 'sha-v3',
            latestVersionSha: 'sha-v4'
        });
        expect(mockListTags).toHaveBeenCalledWith({
            owner: 'actions',
            repo: 'checkout',
            per_page: 1
        });
        expect(mockGetRef).toHaveBeenCalledWith({
            owner: 'actions',
            repo: 'checkout',
            ref: 'tags/v4'
        });
        expect(mockGetRef).toHaveBeenCalledWith({
            owner: 'actions',
            repo: 'checkout',
            ref: 'tags/v3'
        });
    }));
    it('should handle dependency without version', () => __awaiter(void 0, void 0, void 0, function* () {
        const dependencyWithoutVersion = {
            owner: 'actions',
            repo: 'checkout'
        };
        const result = yield checker.checkVersion(dependencyWithoutVersion);
        expect(result).toEqual({
            owner: 'actions',
            repo: 'checkout',
            latestVersion: 'v4',
            latestVersionSha: 'sha-v4'
        });
        expect(mockGetRef).toHaveBeenCalledTimes(1);
    }));
    it('should throw error when API call fails', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockRejectedValue(new Error('API Error'));
        yield expect(checker.checkVersion(mockDependency)).rejects.toThrow('Failed to check version for actions/checkout: Error: API Error');
    }));
    it('should throw error when no tags are found', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockResolvedValue({ data: [] });
        yield expect(checker.checkVersion(mockDependency)).rejects.toThrow('No tags found');
    }));
    it('should throw error when getting ref fails', () => __awaiter(void 0, void 0, void 0, function* () {
        mockGetRef.mockRejectedValue(new Error('Ref Error'));
        yield expect(checker.checkVersion(mockDependency)).rejects.toThrow('Failed to check version for actions/checkout: Error: Failed to get SHA for ref v4: Error: Ref Error');
    }));
});
