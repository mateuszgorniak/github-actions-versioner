"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const index_1 = require("./index");
const core = __importStar(require("@actions/core"));
const file_lister_1 = require("./file-lister");
const dependency_analyzer_1 = require("./dependency-analyzer");
const dependency_lister_1 = require("./dependency-lister");
const version_checker_1 = require("./version-checker");
const dependency_version_merger_1 = require("./dependency-version-merger");
const dependency_reporter_1 = require("./dependency-reporter");
// Mock @actions/core
jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    setOutput: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    setFailed: jest.fn()
}));
// Mock @octokit/rest
jest.mock('@octokit/rest', () => ({
    Octokit: jest.fn().mockImplementation(() => ({
        repos: {
            listTags: jest.fn().mockResolvedValue({
                data: [{ name: 'v4' }]
            })
        },
        git: {
            getRef: jest.fn().mockImplementation(({ ref }) => {
                const sha = ref === 'tags/v4' ? 'sha-v4' : 'sha-v3';
                return Promise.resolve({ data: { object: { sha } } });
            })
        }
    }))
}));
// Mock fs
jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(true),
    readdirSync: jest.fn().mockReturnValue(['workflow.yml']),
    readFileSync: jest.fn().mockReturnValue(`
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
  `)
}));
describe('GitHub Actions Versioner', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        core.getInput.mockImplementation((name) => {
            switch (name) {
                case 'token':
                    return 'test-token';
                case 'workflow_path':
                    return '.github/workflows';
                default:
                    return '';
            }
        });
    });
    it('should run without errors', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockToken = 'test-token';
        const mockWorkflowPath = '.github/workflows';
        const mockWorkflowFiles = ['test.yml'];
        const mockDependencies = [{
                owner: 'actions',
                repo: 'checkout',
                version: 'v3',
                filePath: 'test.yml',
                lineNumber: 1,
                references: [{
                        filePath: 'test.yml',
                        lineNumber: 1
                    }]
            }];
        const mockUniqueDependencies = [{
                owner: 'actions',
                repo: 'checkout',
                version: 'v3',
                filePath: 'test.yml',
                lineNumber: 1,
                references: [{
                        filePath: 'test.yml',
                        lineNumber: 1
                    }]
            }];
        const mockLatestVersions = [{
                owner: 'actions',
                repo: 'checkout',
                version: 'v3',
                latestVersion: 'v4',
                currentVersionSha: 'sha-v3',
                latestVersionSha: 'sha-v4',
                filePath: 'test.yml',
                lineNumber: 1,
                references: [{
                        filePath: 'test.yml',
                        lineNumber: 1
                    }],
                isUpToDate: false
            }];
        const mockDependenciesWithVersions = [Object.assign(Object.assign({}, mockDependencies[0]), { latestVersion: 'v4', currentVersionSha: 'sha-v3', latestVersionSha: 'sha-v4', isUpToDate: false })];
        jest.spyOn(core, 'getInput').mockImplementation((name) => {
            if (name === 'token')
                return mockToken;
            if (name === 'workflow_path')
                return mockWorkflowPath;
            return '';
        });
        jest.spyOn(file_lister_1.FileLister.prototype, 'listWorkflowFiles').mockReturnValue(mockWorkflowFiles);
        jest.spyOn(dependency_analyzer_1.DependencyAnalyzer.prototype, 'analyzeWorkflowFile').mockReturnValue(mockDependencies);
        jest.spyOn(dependency_lister_1.DependencyLister.prototype, 'listUniqueDependencies').mockReturnValue(mockUniqueDependencies);
        jest.spyOn(version_checker_1.VersionVerifier.prototype, 'checkVersion').mockResolvedValue(mockLatestVersions[0]);
        jest.spyOn(dependency_version_merger_1.DependencyVersionMerger.prototype, 'mergeWithVersions').mockReturnValue(mockDependenciesWithVersions);
        jest.spyOn(dependency_reporter_1.DependencyReporter.prototype, 'report').mockReturnValue('test report');
        yield (0, index_1.run)();
        expect(core.info).toHaveBeenCalledWith('Found 1 workflow files');
        expect(core.info).toHaveBeenCalledWith('Found 1 action dependencies');
        expect(core.info).toHaveBeenCalledWith('Found 1 unique action dependencies');
        expect(core.info).toHaveBeenCalledWith('\nDependency Report:');
        expect(core.info).toHaveBeenCalledWith('test report');
        expect(core.warning).toHaveBeenCalledWith('Found 1 outdated actions');
        expect(core.setOutput).toHaveBeenCalledWith('outdated_actions', JSON.stringify(mockDependenciesWithVersions));
        expect(core.setOutput).toHaveBeenCalledWith('status', 'success');
    }));
    it('should handle errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
        const error = new Error('Test error');
        core.getInput.mockImplementation(() => {
            throw error;
        });
        yield (0, index_1.run)();
        expect(core.setFailed).toHaveBeenCalledWith(error.message);
    }));
});
describe('index', () => {
    it('should list unique dependencies', () => {
        const lister = new dependency_lister_1.DependencyLister();
        const uniqueDependencies = lister.listUniqueDependencies();
        expect(uniqueDependencies).toBeDefined();
    });
});
