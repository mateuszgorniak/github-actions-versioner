"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyVersionMerger = void 0;
class DependencyVersionMerger {
    mergeWithVersions(dependencies, latestVersions) {
        const versionMap = new Map();
        latestVersions.forEach(version => {
            versionMap.set(`${version.owner}/${version.repo}`, version.latestVersion);
        });
        return dependencies.map(dep => {
            const latestVersion = versionMap.get(`${dep.owner}/${dep.repo}`);
            return Object.assign(Object.assign({}, dep), { latestVersion, isUpToDate: latestVersion ? dep.version === latestVersion : undefined });
        });
    }
}
exports.DependencyVersionMerger = DependencyVersionMerger;
