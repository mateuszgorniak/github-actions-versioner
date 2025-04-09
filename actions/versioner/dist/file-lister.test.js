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
const file_lister_1 = require("./file-lister");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
jest.mock('fs');
describe('FileLister', () => {
    let fileLister;
    const mockWorkflowPath = '.github/workflows';
    const mockFiles = ['test1.yml', 'test2.yml', 'not-a-workflow.txt'];
    beforeEach(() => {
        fileLister = new file_lister_1.FileLister();
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync.mockReturnValue(mockFiles);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should throw error when workflow directory does not exist', () => {
        fs.existsSync.mockReturnValue(false);
        expect(() => fileLister.listWorkflowFiles()).toThrow('Workflow directory not found');
    });
    it('should return only .yml and .yaml files', () => {
        const files = fileLister.listWorkflowFiles();
        expect(files).toHaveLength(2);
        expect(files[0]).toBe(path.join(mockWorkflowPath, 'test1.yml'));
        expect(files[1]).toBe(path.join(mockWorkflowPath, 'test2.yml'));
    });
    it('should use custom base path when provided', () => {
        const customPath = 'custom/path';
        fileLister = new file_lister_1.FileLister({ basePath: customPath });
        fileLister.listWorkflowFiles();
        expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(customPath));
    });
});
