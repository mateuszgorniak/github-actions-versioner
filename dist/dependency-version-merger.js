"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyVersionMerger = void 0;
class DependencyVersionMerger {
    mergeWithVersions(dependencies, latestVersions) {
        return dependencies.map(dep => {
            const latestVersion = latestVersions.find(v => v.owner === dep.owner && v.repo === dep.repo && v.version === dep.version);
            if (!latestVersion) {
                return Object.assign(Object.assign({}, dep), { isUpToDate: undefined, references: [] });
            }
            return Object.assign(Object.assign({}, dep), { latestVersion: latestVersion.latestVersion, currentVersionSha: latestVersion.currentVersionSha, latestVersionSha: latestVersion.latestVersionSha, isUpToDate: latestVersion.version === latestVersion.latestVersion, error: latestVersion.error, references: latestVersion.references });
        });
    }
}
exports.DependencyVersionMerger = DependencyVersionMerger;
