import * as core from '@actions/core';

export async function run(): Promise<void> {
  try {
    const workflowPath = core.getInput('workflow_path');
    core.info(`Checking workflow files in: ${workflowPath}`);
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
