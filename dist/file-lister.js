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
exports.FileLister = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FileLister {
    constructor(options = {}) {
        this.basePath = options.basePath || '.github/workflows';
        this.pattern = options.pattern || '*.yml';
    }
    /**
     * Lists all workflow files in the specified directory
     * @returns Array of file paths relative to the workspace root
     */
    listWorkflowFiles() {
        // If the path is absolute (starts with /), use it as is
        // Otherwise, join it with the current working directory
        const workflowPath = this.basePath.startsWith('/')
            ? this.basePath
            : path.join(process.cwd(), this.basePath);
        if (!fs.existsSync(workflowPath)) {
            throw new Error(`Workflow directory not found at: ${workflowPath}`);
        }
        const files = fs.readdirSync(workflowPath);
        return files
            .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
            .map(file => path.join(this.basePath, file));
    }
}
exports.FileLister = FileLister;
