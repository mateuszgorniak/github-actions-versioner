"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyReporter = void 0;
class DependencyReporter {
    report(dependencies) {
        if (dependencies.length === 0) {
            return 'No dependencies found';
        }
        return dependencies.map(dep => this.formatDependency(dep)).join('\n');
    }
    formatDependency(dep) {
        var _a, _b;
        let status = '';
        if (dep.error) {
            status = `❌ error: ${dep.error}`;
        }
        else if (dep.isUpToDate) {
            status = '✅ up to date';
        }
        else {
            const currentSha = ((_a = dep.currentVersionSha) === null || _a === void 0 ? void 0 : _a.substring(0, 7)) || 'unknown';
            const latestSha = ((_b = dep.latestVersionSha) === null || _b === void 0 ? void 0 : _b.substring(0, 7)) || 'unknown';
            status = `⚠️ update available: ${dep.version} (${currentSha}) -> ${dep.latestVersion} (${latestSha})`;
        }
        const reference = dep.references[0] || { filePath: 'unknown', lineNumber: 0 };
        return `${dep.owner}/${dep.repo}@${dep.version} (${reference.filePath}:${reference.lineNumber}) - ${status}`;
    }
}
exports.DependencyReporter = DependencyReporter;
