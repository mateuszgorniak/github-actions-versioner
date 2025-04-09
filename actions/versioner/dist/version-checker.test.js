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
jest.mock('@octokit/rest', () => ({
    Octokit: jest.fn().mockImplementation(() => ({
        repos: {
            listTags: mockListTags
        }
    }))
}));
describe('VersionChecker', () => {
    let checker;
    const mockToken = 'test-token';
    const mockDependency = {
        owner: 'actions',
        repo: 'checkout'
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mockListTags.mockResolvedValue({
            data: [
                { name: 'v4' },
                { name: 'v3' }
            ]
        });
        checker = new version_checker_1.VersionChecker(mockToken);
    });
    it('should check if dependency is up to date', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield checker.checkVersion(mockDependency);
        expect(result).toEqual({
            owner: 'actions',
            repo: 'checkout',
            latestVersion: 'v4'
        });
        expect(mockListTags).toHaveBeenCalledWith({
            owner: 'actions',
            repo: 'checkout',
            per_page: 1
        });
    }));
    it('should throw error when API call fails', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockRejectedValue(new Error('API Error'));
        yield expect(checker.checkVersion(mockDependency)).rejects.toThrow('Failed to check version for actions/checkout: Error: API Error');
    }));
    it('should throw error when no tags are found', () => __awaiter(void 0, void 0, void 0, function* () {
        mockListTags.mockResolvedValue({ data: [] });
        yield expect(checker.checkVersion(mockDependency)).rejects.toThrow('No tags found');
    }));
});
