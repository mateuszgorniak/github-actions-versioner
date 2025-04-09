"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyReporter = void 0;
class DependencyReporter {
    report(dependencies) {
        const reportLines = [];
        dependencies.forEach(dep => {
            var _a, _b;
            const status = dep.isUpToDate
                ? '✅ up to date'
                : dep.latestVersion
                    ? `⚠️ update available: ${dep.version} (${(_a = dep.currentVersionSha) === null || _a === void 0 ? void 0 : _a.substring(0, 7)}) -> ${dep.latestVersion} (${(_b = dep.latestVersionSha) === null || _b === void 0 ? void 0 : _b.substring(0, 7)})`
                    : '❌ version check failed';
            reportLines.push(`${dep.owner}/${dep.repo}@${dep.version} (${dep.filePath}:${dep.lineNumber}) - ${status}`);
        });
        return reportLines.join('\n');
    }
}
exports.DependencyReporter = DependencyReporter;
