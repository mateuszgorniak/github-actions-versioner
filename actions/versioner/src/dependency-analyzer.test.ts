import { DependencyAnalyzer } from './dependency-analyzer';
import * as fs from 'fs';

jest.mock('fs');

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer;
  const mockFilePath = 'test.yml';
  const mockContent = `
name: Test Workflow
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      - uses: some/action@v1.2.3
      - uses: another/action@main
  `;

  beforeEach(() => {
    analyzer = new DependencyAnalyzer();
    (fs.readFileSync as jest.Mock).mockReturnValue(mockContent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should extract all action dependencies from workflow file', () => {
    const dependencies = analyzer.analyzeWorkflowFile(mockFilePath);

    expect(dependencies).toHaveLength(4);
    expect(dependencies[0]).toEqual({
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      lineNumber: 8,
      filePath: mockFilePath
    });
    expect(dependencies[1]).toEqual({
      owner: 'actions',
      repo: 'setup-node',
      version: 'v3',
      lineNumber: 9,
      filePath: mockFilePath
    });
    expect(dependencies[2]).toEqual({
      owner: 'some',
      repo: 'action',
      version: 'v1.2.3',
      lineNumber: 12,
      filePath: mockFilePath
    });
    expect(dependencies[3]).toEqual({
      owner: 'another',
      repo: 'action',
      version: 'main',
      lineNumber: 13,
      filePath: mockFilePath
    });
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
