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
            if (!latestVersion) {
                return Object.assign(Object.assign({}, dep), { latestVersion: undefined, currentVersionSha: undefined, latestVersionSha: undefined, isUpToDate: undefined });
            }
            return Object.assign(Object.assign({}, dep), { latestVersion: latestVersion.latestVersion, currentVersionSha: latestVersion.currentVersionSha, latestVersionSha: latestVersion.latestVersionSha, isUpToDate: latestVersion.currentVersionSha === latestVersion.latestVersionSha });
        });
    }
}
exports.DependencyVersionMerger = DependencyVersionMerger;
