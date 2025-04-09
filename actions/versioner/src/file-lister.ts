import * as fs from 'fs';
import * as path from 'path';

export interface FileListerOptions {
  basePath?: string;
  pattern?: string;
}

export class FileLister {
  private basePath: string;
  private pattern: string;

  constructor(options: FileListerOptions = {}) {
    this.basePath = options.basePath || '.github/workflows';
    this.pattern = options.pattern || '*.yml';
  }

  /**
   * Lists all workflow files in the specified directory
   * @returns Array of file paths relative to the workspace root
   */
  public listWorkflowFiles(): string[] {
    const workflowPath = path.join(process.cwd(), this.basePath);

    if (!fs.existsSync(workflowPath)) {
      throw new Error(`Workflow directory not found at: ${workflowPath}`);
    }

    const files = fs.readdirSync(workflowPath);
    return files
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
      .map(file => path.join(this.basePath, file));
  }
}
