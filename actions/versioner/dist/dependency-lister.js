"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyLister = void 0;
class DependencyLister {
    listUniqueDependencies(dependencies) {
        const uniqueDeps = new Set();
        const unique = [];
        for (const dep of dependencies) {
            const key = `${dep.owner}/${dep.repo}`;
            if (!uniqueDeps.has(key)) {
                uniqueDeps.add(key);
                unique.push({
                    owner: dep.owner,
                    repo: dep.repo
                });
            }
        }
        return unique;
    }
}
exports.DependencyLister = DependencyLister;
