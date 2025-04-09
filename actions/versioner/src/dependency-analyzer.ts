import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface ActionDependency {
  owner: string;
  repo: string;
  version: string;
  lineNumber: number;
  filePath: string;
}

export class DependencyAnalyzer {
  /**
   * Analyzes a workflow file and extracts all GitHub Actions dependencies
   * @param filePath Path to the workflow file
   * @returns Array of action dependencies found in the file
   */
  public analyzeWorkflowFile(filePath: string): ActionDependency[] {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const dependencies: ActionDependency[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/uses:\s*([^@\s]+)@([^\s]+)/);
      if (match) {
        const [_, actionRef, version] = match;
        const [owner, repo] = actionRef.split('/');

        if (owner && repo) {
          dependencies.push({
            owner,
            repo,
            version,
            lineNumber: index + 1,
            filePath
          });
        }
      }
    });

    return dependencies;
  }
}
