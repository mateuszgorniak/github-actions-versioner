"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionComparator = void 0;
const semver = __importStar(require("semver"));
class VersionComparator {
    /**
     * Normalizes version name by removing 'v' prefix if present
     */
    static normalizeVersion(version) {
        return version.replace(/^v/, '');
    }
    /**
     * Checks if the version is a valid semver version
     */
    static isSemverVersion(version) {
        return semver.valid(VersionComparator.normalizeVersion(version)) !== null;
    }
    /**
     * Compares two semver versions
     * Returns:
     * - negative number if a < b
     * - positive number if a > b
     * - 0 if a == b
     */
    static compareSemverVersions(a, b) {
        return semver.compare(VersionComparator.normalizeVersion(a), VersionComparator.normalizeVersion(b));
    }
    /**
     * Creates VersionInfo object from version name
     */
    static createVersionInfo(name, isBranch = false) {
        return {
            name,
            cleanName: VersionComparator.normalizeVersion(name),
            isSemver: VersionComparator.isSemverVersion(name),
            isBranch
        };
    }
    /**
     * Compares two versions according to semver rules
     * Returns:
     * - negative number if a < b
     * - positive number if a > b
     * - 0 if a == b
     */
    static compareVersions(a, b) {
        // If both are semver versions, compare using semver
        if (a.isSemver && b.isSemver) {
            return semver.rcompare(a.cleanName, b.cleanName);
        }
        // If only one is semver, it's considered higher
        if (a.isSemver && !b.isSemver)
            return -1;
        if (!a.isSemver && b.isSemver)
            return 1;
        // If both are branches, compare alphabetically
        if (a.isBranch && b.isBranch) {
            return a.name.localeCompare(b.name);
        }
        // If only one is a branch, it's considered higher
        if (a.isBranch && !b.isBranch)
            return -1;
        if (!a.isBranch && b.isBranch)
            return 1;
        // For non-semver tags, compare alphabetically
        return a.name.localeCompare(b.name);
    }
    /**
     * Finds the latest version from an array of versions
     */
    static findLatestVersion(versions) {
        if (versions.length === 0)
            return null;
        return versions.reduce((latest, current) => VersionComparator.compareVersions(current, latest) < 0 ? current : latest);
    }
}
exports.VersionComparator = VersionComparator;
