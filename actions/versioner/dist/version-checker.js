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
exports.VersionVerifier = void 0;
const rest_1 = require("@octokit/rest");
const version_comparator_1 = require("./version-comparator");
/**
 * Handles the complete version verification process
 * - Manages GitHub API communication
 * - Coordinates version verification workflow
 * - Caches version information
 * - Handles commit information retrieval
 * - Determines version update strategy
 */
class VersionVerifier {
    constructor(token) {
        this.octokit = new rest_1.Octokit({ auth: token });
        this.versionCache = new Map();
    }
    getCommitInfo(owner, repo, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { data } = yield this.octokit.repos.getCommit({
                    owner,
                    repo,
                    ref
                });
                return {
                    sha: data.sha,
                    date: ((_a = data.commit.committer) === null || _a === void 0 ? void 0 : _a.date) || ((_b = data.commit.author) === null || _b === void 0 ? void 0 : _b.date) || new Date().toISOString()
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(errorMessage);
            }
        });
    }
    getVersionInfo(owner, repo, version) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${owner}/${repo}/${version}`;
            if (this.versionCache.has(cacheKey)) {
                return this.versionCache.get(cacheKey);
            }
            try {
                const { data } = yield this.octokit.git.getRef({
                    owner,
                    repo,
                    ref: `tags/${version}`
                });
                const commitInfo = yield this.getCommitInfo(owner, repo, data.object.sha);
                const info = version_comparator_1.VersionParser.createVersionInfo(version, false, commitInfo.sha, new Date(commitInfo.date));
                this.versionCache.set(cacheKey, info);
                return info;
            }
            catch (error) {
                try {
                    const { data } = yield this.octokit.git.getRef({
                        owner,
                        repo,
                        ref: `heads/${version}`
                    });
                    const commitInfo = yield this.getCommitInfo(owner, repo, data.object.sha);
                    const info = version_comparator_1.VersionParser.createVersionInfo(version, true, commitInfo.sha, new Date(commitInfo.date));
                    this.versionCache.set(cacheKey, info);
                    return info;
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    throw new Error(errorMessage);
                }
            }
        });
    }
    findLatestVersion(owner, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data: tags } = yield this.octokit.repos.listTags({
                    owner,
                    repo,
                    per_page: 100
                });
                if (tags.length === 0) {
                    const { data: repoInfo } = yield this.octokit.repos.get({
                        owner,
                        repo
                    });
                    return this.getVersionInfo(owner, repo, repoInfo.default_branch);
                }
                const versions = yield Promise.all(tags.map((tag) => __awaiter(this, void 0, void 0, function* () {
                    const commitInfo = yield this.getCommitInfo(owner, repo, tag.commit.sha);
                    return version_comparator_1.VersionParser.createVersionInfo(tag.name, false, tag.commit.sha, new Date(commitInfo.date));
                })));
                return version_comparator_1.VersionParser.findLatestVersion(versions);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(errorMessage);
            }
        });
    }
    checkVersion(dependency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentVersionInfo = yield this.getVersionInfo(dependency.owner, dependency.repo, dependency.version);
                const latestVersionInfo = yield this.findLatestVersion(dependency.owner, dependency.repo);
                const isUpToDate = version_comparator_1.VersionParser.compareVersions(currentVersionInfo.version, latestVersionInfo.version) >= 0;
                return {
                    owner: dependency.owner,
                    repo: dependency.repo,
                    version: dependency.version,
                    latestVersion: latestVersionInfo.version,
                    currentVersionSha: currentVersionInfo.sha,
                    latestVersionSha: latestVersionInfo.sha,
                    references: dependency.references,
                    isUpToDate
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    owner: dependency.owner,
                    repo: dependency.repo,
                    version: dependency.version,
                    latestVersion: dependency.version,
                    currentVersionSha: 'unknown',
                    latestVersionSha: 'unknown',
                    references: dependency.references,
                    error: errorMessage,
                    isUpToDate: false
                };
            }
        });
    }
}
exports.VersionVerifier = VersionVerifier;
