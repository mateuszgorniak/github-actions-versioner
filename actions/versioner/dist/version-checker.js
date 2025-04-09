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
class VersionChecker {
    constructor(token) {
        this.octokit = new rest_1.Octokit({
            auth: token
        });
    }
    /**
     * Checks if the given dependency is up to date
     * @param dependency Compressed dependency to check
     * @returns Promise with version check result
     */
    checkVersion(dependency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield this.octokit.repos.listTags({
                    owner: dependency.owner,
                    repo: dependency.repo,
                    per_page: 1
                });
                if (!data || data.length === 0) {
                    throw new Error('No tags found');
                }
                return {
                    owner: dependency.owner,
                    repo: dependency.repo,
                    latestVersion: data[0].name
                };
            }
            catch (error) {
                throw new Error(`Failed to check version for ${dependency.owner}/${dependency.repo}: ${error}`);
            }
        });
    }
}
exports.VersionChecker = VersionChecker;
