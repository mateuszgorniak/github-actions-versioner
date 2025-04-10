"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionChecker = void 0;
const rest_1 = require("@octokit/rest");
const version_comparator_1 = require("./version-comparator");
class VersionChecker {
    constructor(token) {
        this.octokit = new rest_1.Octokit({ auth: token });
    }
    getCommitInfo(owner, repo, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                // First try to get the reference directly
                const { data: refData } = yield this.octokit.git.getRef({
                    owner,
                    repo,
                    ref: ref
                });
                const { data: commit } = yield this.octokit.repos.getCommit({
                    owner,
                    repo,
                    ref: refData.object.sha
                });
                return {
                    sha: refData.object.sha,
                    date: new Date(((_a = commit.commit.committer) === null || _a === void 0 ? void 0 : _a.date) || ((_b = commit.commit.author) === null || _b === void 0 ? void 0 : _b.date) || '')
                };
            }
            catch (error) {
                // If direct reference fails, try as tag
                try {
                    const { data: tagRef } = yield this.octokit.git.getRef({
                        owner,
                        repo,
                        ref: `tags/${ref}`
                    });
                    const { data: commit } = yield this.octokit.repos.getCommit({
                        owner,
                        repo,
                        ref: tagRef.object.sha
                    });
                    return {
                        sha: tagRef.object.sha,
                        date: new Date(((_c = commit.commit.committer) === null || _c === void 0 ? void 0 : _c.date) || ((_d = commit.commit.author) === null || _d === void 0 ? void 0 : _d.date) || '')
                    };
                }
                catch (tagError) {
                    // If tag fails, try as branch
                    try {
                        const { data: branchRef } = yield this.octokit.git.getRef({
                            owner,
                            repo,
                            ref: `heads/${ref}`
                        });
                        const { data: commit } = yield this.octokit.repos.getCommit({
                            owner,
                            repo,
                            ref: branchRef.object.sha
                        });
                        return {
                            sha: branchRef.object.sha,
                            date: new Date(((_e = commit.commit.committer) === null || _e === void 0 ? void 0 : _e.date) || ((_f = commit.commit.author) === null || _f === void 0 ? void 0 : _f.date) || '')
                        };
                    }
                    catch (branchError) {
                        throw new Error(`Reference ${ref} not found as either tag or branch`);
                    }
                }
            }
        });
    }
    findHighestSemverTag(tags) {
        const semverTags = tags.filter(tag => version_comparator_1.VersionComparator.isSemverVersion(tag.name));
        if (semverTags.length === 0)
            return null;
        return semverTags.reduce((highest, current) => {
            const comparison = version_comparator_1.VersionComparator.compareSemverVersions(current.name, highest.name);
            return comparison > 0 ? current : highest;
        });
    }
    findLatestCustomTag(tags) {
        const customTags = tags.filter(tag => !version_comparator_1.VersionComparator.isSemverVersion(tag.name));
        if (customTags.length === 0)
            return null;
        // Prefer 'latest' tag if it exists
        const latestTag = customTags.find(tag => tag.name === 'latest');
        if (latestTag)
            return latestTag;
        // Otherwise, use the most recent tag by commit date
        return customTags.reduce((latest, current) => current.commitInfo.date > latest.commitInfo.date ? current : latest);
    }
    checkVersion(dependency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get current version commit info
                const currentVersionInfo = yield this.getCommitInfo(dependency.owner, dependency.repo, dependency.version);
                // First try to get tags
                const { data: tags } = yield this.octokit.repos.listTags({
                    owner: dependency.owner,
                    repo: dependency.repo,
                    per_page: 100
                });
                let latestVersion;
                let latestVersionInfo;
                if (tags && tags.length > 0) {
                    // Get commit info for each tag
                    const tagInfos = yield Promise.all(tags.map((tag) => __awaiter(this, void 0, void 0, function* () {
                        return ({
                            name: tag.name,
                            commitInfo: yield this.getCommitInfo(dependency.owner, dependency.repo, tag.name)
                        });
                    })));
                    // Find highest semver tag
                    const highestSemverTag = this.findHighestSemverTag(tagInfos);
                    if (highestSemverTag) {
                        // If current version is also semver, compare versions
                        if (version_comparator_1.VersionComparator.isSemverVersion(dependency.version)) {
                            const comparison = version_comparator_1.VersionComparator.compareSemverVersions(highestSemverTag.name, dependency.version);
                            if (comparison > 0) {
                                // Higher version found
                                latestVersion = highestSemverTag.name;
                                latestVersionInfo = highestSemverTag.commitInfo;
                            }
                            else {
                                // No higher version found
                                return {
                                    owner: dependency.owner,
                                    repo: dependency.repo,
                                    version: dependency.version,
                                    latestVersion: dependency.version,
                                    currentVersionSha: currentVersionInfo.sha,
                                    latestVersionSha: currentVersionInfo.sha,
                                    references: dependency.references
                                };
                            }
                        }
                        else {
                            // Current version is not semver (e.g., branch), suggest the highest semver
                            latestVersion = highestSemverTag.name;
                            latestVersionInfo = highestSemverTag.commitInfo;
                        }
                    }
                    else {
                        // No semver tags found, find latest custom tag
                        const latestCustomTag = this.findLatestCustomTag(tagInfos);
                        if (latestCustomTag) {
                            latestVersion = latestCustomTag.name;
                            latestVersionInfo = latestCustomTag.commitInfo;
                        }
                        else {
                            // No tags found at all, use default branch
                            const { data: repo } = yield this.octokit.repos.get({
                                owner: dependency.owner,
                                repo: dependency.repo
                            });
                            const defaultBranch = repo.default_branch;
                            const defaultBranchInfo = yield this.getCommitInfo(dependency.owner, dependency.repo, defaultBranch);
                            latestVersion = defaultBranch;
                            latestVersionInfo = defaultBranchInfo;
                        }
                    }
                }
                else {
                    // If no tags found, try to get the default branch
                    const { data: repo } = yield this.octokit.repos.get({
                        owner: dependency.owner,
                        repo: dependency.repo
                    });
                    const defaultBranch = repo.default_branch;
                    const defaultBranchInfo = yield this.getCommitInfo(dependency.owner, dependency.repo, defaultBranch);
                    latestVersion = defaultBranch;
                    latestVersionInfo = defaultBranchInfo;
                }
                return {
                    owner: dependency.owner,
                    repo: dependency.repo,
                    version: dependency.version,
                    latestVersion,
                    currentVersionSha: currentVersionInfo.sha,
                    latestVersionSha: latestVersionInfo.sha,
                    references: dependency.references
                };
            }
            catch (error) {
                // Instead of throwing an error, return the current version as the latest
                return {
                    owner: dependency.owner,
                    repo: dependency.repo,
                    version: dependency.version,
                    latestVersion: dependency.version,
                    currentVersionSha: 'unknown',
                    latestVersionSha: 'unknown',
                    references: dependency.references,
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        });
    }
}
exports.VersionChecker = VersionChecker;
