import { DependencyAnalyzer } from './dependency-analyzer';
import * as fs from 'fs';
import { ActionDependency } from './types';

jest.mock('fs');

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer;
  const mockFilePath = 'test.yml';

  beforeEach(() => {
    analyzer = new DependencyAnalyzer();
    jest.resetAllMocks();
  });

  it('should extract all action dependencies from workflow file', () => {
    const mockContent = `
name: Test Workflow
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: some/action@v1.2.3
      - uses: another/action@main
`;
    (fs.readFileSync as jest.Mock).mockReturnValue(mockContent);

    const dependencies = analyzer.analyzeWorkflowFile(mockFilePath);

    expect(dependencies).toHaveLength(4);
    expect(dependencies[0]).toEqual({
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      references: [{
        filePath: mockFilePath,
        lineNumber: 8
      }]
    });
    expect(dependencies[1]).toEqual({
      owner: 'actions',
      repo: 'setup-node',
      version: 'v3',
      references: [{
        filePath: mockFilePath,
        lineNumber: 9
      }]
    });
    expect(dependencies[2]).toEqual({
      owner: 'some',
      repo: 'action',
      version: 'v1.2.3',
      references: [{
        filePath: mockFilePath,
        lineNumber: 10
      }]
    });
    expect(dependencies[3]).toEqual({
      owner: 'another',
      repo: 'action',
      version: 'main',
      references: [{
        filePath: mockFilePath,
        lineNumber: 11
      }]
    });

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf8');
  });

  it('should handle empty workflow file', () => {
    (fs.readFileSync as jest.Mock).mockReturnValue('');
    const dependencies = analyzer.analyzeWorkflowFile(mockFilePath);
    expect(dependencies).toHaveLength(0);
  });

  it('should handle workflow file without any actions', () => {
    const content = `
name: Test Workflow
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Hello"
    `;
    (fs.readFileSync as jest.Mock).mockReturnValue(content);
    const dependencies = analyzer.analyzeWorkflowFile(mockFilePath);
    expect(dependencies).toHaveLength(0);
  });
});
