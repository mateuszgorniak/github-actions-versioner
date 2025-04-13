import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ActionDependency, FileReference } from './types';

export class DependencyAnalyzer {
  /**
   * Analyzes a workflow file and extracts all GitHub Actions dependencies
   * @param filePath Path to the workflow file
   * @returns Array of action dependencies found in the file
   */
  public analyzeWorkflowFile(filePath: string): ActionDependency[] {
    const content = fs.readFileSync(filePath, 'utf8');
    const dependencies: ActionDependency[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/uses:\s+([^@]+)@([^}\s]+)/);
      if (match) {
        const [owner, repo] = match[1].split('/');
        const version = match[2];
        const reference: FileReference = {
          filePath,
          lineNumber: i + 1
        };
        dependencies.push({
          owner,
          repo,
          version,
          references: [reference]
        });
      }
    }

    return dependencies;
  }
}
