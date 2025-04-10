"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyLister = void 0;
const dependency_analyzer_1 = require("./dependency-analyzer");
const file_lister_1 = require("./file-lister");
class DependencyLister {
    constructor(options = {}, dependencyAnalyzer, fileLister) {
        this.dependencyAnalyzer = dependencyAnalyzer || new dependency_analyzer_1.DependencyAnalyzer();
        this.fileLister = fileLister || new file_lister_1.FileLister(options);
    }
    listUniqueDependencies() {
        const files = this.fileLister.listWorkflowFiles();
        const allDependencies = files.flatMap(file => this.dependencyAnalyzer.analyzeWorkflowFile(file));
        const uniqueDependencies = new Map();
        allDependencies.forEach(dependency => {
            const key = `${dependency.owner}/${dependency.repo}@${dependency.version}`;
            if (!uniqueDependencies.has(key)) {
                uniqueDependencies.set(key, {
                    owner: dependency.owner,
                    repo: dependency.repo,
                    version: dependency.version,
                    references: dependency.references
                });
            }
            else {
                const existing = uniqueDependencies.get(key);
                existing.references.push(...dependency.references);
            }
        });
        return Array.from(uniqueDependencies.values());
    }
}
exports.DependencyLister = DependencyLister;
