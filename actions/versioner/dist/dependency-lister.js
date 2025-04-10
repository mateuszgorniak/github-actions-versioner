"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyLister = void 0;
class DependencyLister {
    listUniqueDependencies(dependencies) {
        const uniqueMap = new Map();
        dependencies.forEach(dep => {
            const key = `${dep.owner}/${dep.repo}/${dep.version}`;
            const existing = uniqueMap.get(key);
            if (existing) {
                existing.references.push({
                    filePath: dep.filePath,
                    lineNumber: dep.lineNumber
                });
            }
            else {
                uniqueMap.set(key, {
                    owner: dep.owner,
                    repo: dep.repo,
                    version: dep.version,
                    references: [{
                            filePath: dep.filePath,
                            lineNumber: dep.lineNumber
                        }]
                });
            }
        });
        return Array.from(uniqueMap.values());
    }
}
exports.DependencyLister = DependencyLister;
