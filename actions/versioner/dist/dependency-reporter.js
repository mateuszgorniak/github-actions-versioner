"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyReporter = void 0;
class DependencyReporter {
    report(dependencies) {
        const reportLines = [];
        dependencies.forEach(dep => {
            const status = dep.isUpToDate
                ? '✅ up to date'
                : dep.latestVersion
                    ? `⚠️ update available: ${dep.version} -> ${dep.latestVersion}`
                    : '❌ version check failed';
            reportLines.push(`${dep.owner}/${dep.repo}@${dep.version} (${dep.filePath}:${dep.lineNumber}) - ${status}`);
        });
        return reportLines.join('\n');
    }
}
exports.DependencyReporter = DependencyReporter;
