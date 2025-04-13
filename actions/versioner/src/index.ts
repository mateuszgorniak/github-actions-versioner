import * as core from '@actions/core';
import { FileLister } from './file-lister';
import { DependencyAnalyzer } from './dependency-analyzer';
import { DependencyLister } from './dependency-lister';
import { VersionVerifier } from './version-checker';
import { DependencyVersionMerger } from './dependency-version-merger';
import { DependencyReporter } from './dependency-reporter';

export async function run(): Promise<void> {
  try {
    const token = core.getInput('token');
    const workflowPath = core.getInput('workflow_path');

    const fileLister = new FileLister({ basePath: workflowPath });
    const analyzer = new DependencyAnalyzer();
    const lister = new DependencyLister({ basePath: workflowPath }, analyzer, fileLister);
    const verifier = new VersionVerifier(token);
    const merger = new DependencyVersionMerger();
    const reporter = new DependencyReporter();

    // 1. List all workflow files
    const workflowFiles = fileLister.listWorkflowFiles();
    core.info(`Found ${workflowFiles.length} workflow files`);

    // 2. Get all dependencies
    const allDependencies = workflowFiles.flatMap(file => analyzer.analyzeWorkflowFile(file));
    core.info(`Found ${allDependencies.length} action dependencies`);

    // 3. Get unique dependencies
    const uniqueDependencies = lister.listUniqueDependencies();
    core.info(`Found ${uniqueDependencies.length} unique action dependencies`);

    // 4. Check versions
    const latestVersions = await Promise.all(
      uniqueDependencies.map(dep => verifier.checkVersion(dep))
    );

    // 5. Merge dependencies with their latest versions
    const dependenciesWithVersions = merger.mergeWithVersions(
      uniqueDependencies,
      latestVersions
    );

    // 6. Generate report
    const report = reporter.report(dependenciesWithVersions);
    core.info('\nDependency Report:');
    core.info(report);

    // 7. Set outputs
    // 6. Set outputs
    const outdatedActions = dependenciesWithVersions.filter(
      dep => dep.latestVersion && !dep.isUpToDate
    );

    if (outdatedActions.length > 0) {
      core.warning(`Found ${outdatedActions.length} outdated actions`);
      core.setOutput('outdated_actions', JSON.stringify(outdatedActions));
    } else {
      core.info('All actions are up to date!');
    }

    core.setOutput('status', 'success');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

if (require.main === module) {
  run();
}
