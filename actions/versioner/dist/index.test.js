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
                data: [{ name: 'v1' }]
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
        yield (0, index_1.run)();
        expect(core.setOutput).toHaveBeenCalledWith('status', 'success');
        expect(core.info).toHaveBeenCalledWith('Found 1 workflow files');
        expect(core.info).toHaveBeenCalledWith('Found 1 action dependencies');
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
