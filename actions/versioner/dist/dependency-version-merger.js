"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyVersionMerger = void 0;
class DependencyVersionMerger {
    mergeWithVersions(dependencies, latestVersions) {
        const versionMap = new Map();
        latestVersions.forEach(version => {
            versionMap.set(`${version.owner}/${version.repo}`, version);
        });
        return dependencies.map(dep => {
            const latestVersion = versionMap.get(`${dep.owner}/${dep.repo}`);
            return Object.assign(Object.assign({}, dep), { latestVersion: latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.latestVersion, currentVersionSha: latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.currentVersionSha, latestVersionSha: latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.latestVersionSha, isUpToDate: latestVersion ? dep.version === latestVersion.latestVersion : undefined });
        });
    }
}
exports.DependencyVersionMerger = DependencyVersionMerger;
