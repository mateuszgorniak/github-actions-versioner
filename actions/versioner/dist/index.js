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
exports.run = run;
const core = __importStar(require("@actions/core"));
const file_lister_1 = require("./file-lister");
const dependency_analyzer_1 = require("./dependency-analyzer");
const dependency_lister_1 = require("./dependency-lister");
const version_checker_1 = require("./version-checker");
const dependency_version_merger_1 = require("./dependency-version-merger");
const dependency_reporter_1 = require("./dependency-reporter");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput('token');
            const workflowPath = core.getInput('workflow_path');
            const fileLister = new file_lister_1.FileLister({ basePath: workflowPath });
            const analyzer = new dependency_analyzer_1.DependencyAnalyzer();
            const lister = new dependency_lister_1.DependencyLister();
            const checker = new version_checker_1.VersionChecker(token);
            const merger = new dependency_version_merger_1.DependencyVersionMerger();
            const reporter = new dependency_reporter_1.DependencyReporter();
            // 1. List all workflow files
            const workflowFiles = fileLister.listWorkflowFiles();
            core.info(`Found ${workflowFiles.length} workflow files`);
            // 2. Analyze dependencies in each file
            const allDependencies = workflowFiles.flatMap(file => analyzer.analyzeWorkflowFile(file));
            core.info(`Found ${allDependencies.length} action dependencies`);
            // 3. Get unique dependencies
            const uniqueDependencies = lister.listUniqueDependencies(allDependencies);
            core.info(`Found ${uniqueDependencies.length} unique action dependencies`);
            // 4. Check versions
            const latestVersions = yield Promise.all(uniqueDependencies.map(dep => checker.checkVersion(dep)));
            // 5. Merge dependencies with their latest versions
            const dependenciesWithVersions = merger.mergeWithVersions(allDependencies, latestVersions);
            // 6. Generate report
            const report = reporter.report(dependenciesWithVersions);
            core.info('\nDependency Report:');
            core.info(report);
            // 7. Set outputs
            const outdatedActions = dependenciesWithVersions.filter(dep => dep.latestVersion && !dep.isUpToDate);
            if (outdatedActions.length > 0) {
                core.warning(`Found ${outdatedActions.length} outdated actions`);
                core.setOutput('outdated_actions', JSON.stringify(outdatedActions));
            }
            else {
                core.info('All actions are up to date!');
            }
            core.setOutput('status', 'success');
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
        }
    });
}
if (require.main === module) {
    run();
}
