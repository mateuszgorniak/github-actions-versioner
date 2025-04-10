"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyReporter = void 0;
class DependencyReporter {
    report(dependencies) {
        const lines = [];
        dependencies.forEach(dep => {
            var _a, _b;
            const currentVersion = dep.version;
            const latestVersion = dep.latestVersion;
            const currentSha = ((_a = dep.currentVersionSha) === null || _a === void 0 ? void 0 : _a.substring(0, 7)) || 'unknown';
            const latestSha = ((_b = dep.latestVersionSha) === null || _b === void 0 ? void 0 : _b.substring(0, 7)) || 'unknown';
            let status = '';
            if (dep.error) {
                status = `⚠️ error: ${dep.error}`;
            }
            else if (dep.isUpToDate) {
                status = '✅ up to date';
            }
            else {
                status = `⚠️ update available: ${currentVersion} (${currentSha}) -> ${latestVersion} (${latestSha})`;
            }
            const line = `${dep.owner}/${dep.repo}@${dep.version} (${dep.filePath}:${dep.lineNumber}) - ${status}`;
            lines.push(line);
        });
        return lines.join('\n');
    }
}
exports.DependencyReporter = DependencyReporter;
