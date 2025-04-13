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
exports.DependencyAnalyzer = void 0;
const fs = __importStar(require("fs"));
class DependencyAnalyzer {
    /**
     * Analyzes a workflow file and extracts all GitHub Actions dependencies
     * @param filePath Path to the workflow file
     * @returns Array of action dependencies found in the file
     */
    analyzeWorkflowFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const dependencies = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/uses:\s+([^@]+)@([^}\s]+)/);
            if (match) {
                const [owner, repo] = match[1].split('/');
                const version = match[2];
                const reference = {
                    filePath,
                    lineNumber: i + 1
                };
                dependencies.push({
                    owner,
                    repo,
                    version,
                    references: [reference]
                });
            }
        }
        return dependencies;
    }
}
exports.DependencyAnalyzer = DependencyAnalyzer;
