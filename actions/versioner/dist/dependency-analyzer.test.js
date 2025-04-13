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
Object.defineProperty(exports, "__esModule", { value: true });
const dependency_analyzer_1 = require("./dependency-analyzer");
const fs = __importStar(require("fs"));
jest.mock('fs');
describe('DependencyAnalyzer', () => {
    let analyzer;
    const mockFilePath = 'test.yml';
    beforeEach(() => {
        analyzer = new dependency_analyzer_1.DependencyAnalyzer();
        jest.resetAllMocks();
    });
    it('should extract all action dependencies from workflow file', () => {
        const mockContent = `
name: Test Workflow
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: some/action@v1.2.3
      - uses: another/action@main
`;
        fs.readFileSync.mockReturnValue(mockContent);
        const dependencies = analyzer.analyzeWorkflowFile(mockFilePath);
        expect(dependencies).toHaveLength(4);
        expect(dependencies[0]).toEqual({
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            references: [{
                    filePath: mockFilePath,
                    lineNumber: 8
                }]
        });
        expect(dependencies[1]).toEqual({
            owner: 'actions',
            repo: 'setup-node',
            version: 'v3',
            references: [{
                    filePath: mockFilePath,
                    lineNumber: 9
                }]
        });
        expect(dependencies[2]).toEqual({
            owner: 'some',
            repo: 'action',
            version: 'v1.2.3',
            references: [{
                    filePath: mockFilePath,
                    lineNumber: 10
                }]
        });
        expect(dependencies[3]).toEqual({
            owner: 'another',
            repo: 'action',
            version: 'main',
            references: [{
                    filePath: mockFilePath,
                    lineNumber: 11
                }]
        });
        expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf8');
    });
    it('should handle empty workflow file', () => {
        fs.readFileSync.mockReturnValue('');
        const dependencies = analyzer.analyzeWorkflowFile(mockFilePath);
        expect(dependencies).toHaveLength(0);
    });
    it('should handle workflow file without any actions', () => {
        const content = `
name: Test Workflow
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Hello"
    `;
        fs.readFileSync.mockReturnValue(content);
        const dependencies = analyzer.analyzeWorkflowFile(mockFilePath);
        expect(dependencies).toHaveLength(0);
    });
});
