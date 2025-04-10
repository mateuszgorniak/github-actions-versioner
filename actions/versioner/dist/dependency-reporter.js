"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyReporter = void 0;
class DependencyReporter {
    report(dependencies) {
        const reportLines = [];
        dependencies.forEach(dep => {
            var _a, _b;
            let status;
            if (dep.isUpToDate === undefined) {
                status = '❌ version check failed - could not compare versions';
            }
            else if (dep.isUpToDate) {
                status = '✅ up to date';
            }
            else {
                status = `⚠️ update available: ${dep.version} (${(_a = dep.currentVersionSha) === null || _a === void 0 ? void 0 : _a.substring(0, 7)}) -> ${dep.latestVersion} (${(_b = dep.latestVersionSha) === null || _b === void 0 ? void 0 : _b.substring(0, 7)})`;
            }
            reportLines.push(`${dep.owner}/${dep.repo}@${dep.version} (${dep.filePath}:${dep.lineNumber}) - ${status}`);
        });
        return reportLines.join('\n');
    }
}
exports.DependencyReporter = DependencyReporter;
