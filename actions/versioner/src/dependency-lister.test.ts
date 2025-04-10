import { DependencyLister } from './dependency-lister';
import { ActionDependency, UniqueDependency, FileReference } from './types';
import { DependencyAnalyzer } from './dependency-analyzer';
import { FileLister } from './file-lister';

jest.mock('./dependency-analyzer');
jest.mock('./file-lister');

describe('DependencyLister', () => {
  let lister: DependencyLister;
  let mockDependencyAnalyzer: jest.Mocked<DependencyAnalyzer>;
  let mockFileLister: jest.Mocked<FileLister>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockDependencyAnalyzer = new DependencyAnalyzer() as jest.Mocked<DependencyAnalyzer>;
    mockFileLister = new FileLister() as jest.Mocked<FileLister>;
    lister = new DependencyLister({}, mockDependencyAnalyzer, mockFileLister);
  });

  it('should list unique dependencies', () => {
    const mockFiles = ['workflow1.yml', 'workflow2.yml'];
    const mockDependency: ActionDependency = {
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      references: [{ filePath: 'workflow1.yml', lineNumber: 1 }]
    };

    mockFileLister.listWorkflowFiles.mockReturnValue(mockFiles);
    mockDependencyAnalyzer.analyzeWorkflowFile
      .mockReturnValueOnce([mockDependency])
      .mockReturnValueOnce([mockDependency]);

    const result = lister.listUniqueDependencies();
    expect(result).toHaveLength(1);
    expect(result[0].references).toHaveLength(2);
    expect(mockDependencyAnalyzer.analyzeWorkflowFile).toHaveBeenCalledTimes(2);
  });

  it('should handle empty dependencies', () => {
    mockFileLister.listWorkflowFiles.mockReturnValue([]);

    const result = lister.listUniqueDependencies();
    expect(result).toEqual([]);
    expect(mockDependencyAnalyzer.analyzeWorkflowFile).not.toHaveBeenCalled();
  });

  it('should list unique dependencies with their references', () => {
    const mockFiles = ['workflow1.yml', 'workflow2.yml', 'workflow3.yml'];
    const mockDependencies1: ActionDependency[] = [{
      owner: 'actions',
      repo: 'checkout',
      version: 'v4',
      references: [{ filePath: 'workflow1.yml', lineNumber: 1 }]
    }];
    const mockDependencies2: ActionDependency[] = [{
      owner: 'actions',
      repo: 'checkout',
      version: 'v4',
      references: [{ filePath: 'workflow2.yml', lineNumber: 2 }]
    }];
    const mockDependencies3: ActionDependency[] = [
      {
        owner: 'actions',
        repo: 'checkout',
        version: 'v3',
        references: [{ filePath: 'workflow3.yml', lineNumber: 3 }]
      },
      {
        owner: 'actions',
        repo: 'setup-node',
        version: 'v3',
        references: [{ filePath: 'workflow1.yml', lineNumber: 4 }]
      }
    ];

    mockFileLister.listWorkflowFiles.mockReturnValue(mockFiles);
    mockDependencyAnalyzer.analyzeWorkflowFile
      .mockReturnValueOnce(mockDependencies1)
      .mockReturnValueOnce(mockDependencies2)
      .mockReturnValueOnce(mockDependencies3);

    const result = lister.listUniqueDependencies();

    expect(result).toHaveLength(3);

    // Check actions/checkout@v4
    const checkoutV4 = result.find(d => d.owner === 'actions' && d.repo === 'checkout' && d.version === 'v4');
    expect(checkoutV4).toBeDefined();
    expect(checkoutV4?.references).toHaveLength(2);
    expect(checkoutV4?.references).toContainEqual({ filePath: 'workflow1.yml', lineNumber: 1 });
    expect(checkoutV4?.references).toContainEqual({ filePath: 'workflow2.yml', lineNumber: 2 });

    // Check actions/checkout@v3
    const checkoutV3 = result.find(d => d.owner === 'actions' && d.repo === 'checkout' && d.version === 'v3');
    expect(checkoutV3).toBeDefined();
    expect(checkoutV3?.references).toHaveLength(1);
    expect(checkoutV3?.references).toContainEqual({ filePath: 'workflow3.yml', lineNumber: 3 });

    // Check actions/setup-node@v3
    const setupNode = result.find(d => d.owner === 'actions' && d.repo === 'setup-node' && d.version === 'v3');
    expect(setupNode).toBeDefined();
    expect(setupNode?.references).toHaveLength(1);
    expect(setupNode?.references).toContainEqual({ filePath: 'workflow1.yml', lineNumber: 4 });
  });

  it('should merge duplicate dependencies', () => {
    const mockFiles = ['workflow1.yml', 'workflow2.yml'];
    const mockDependency1: ActionDependency = {
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      references: [{ filePath: 'workflow1.yml', lineNumber: 1 }]
    };
    const mockDependency2: ActionDependency = {
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      references: [{ filePath: 'workflow2.yml', lineNumber: 1 }]
    };

    mockFileLister.listWorkflowFiles.mockReturnValue(mockFiles);
    mockDependencyAnalyzer.analyzeWorkflowFile
      .mockReturnValueOnce([mockDependency1])
      .mockReturnValueOnce([mockDependency2]);

    const result = lister.listUniqueDependencies();
    expect(result).toHaveLength(1);
    expect(result[0].references).toHaveLength(2);
    expect(mockDependencyAnalyzer.analyzeWorkflowFile).toHaveBeenCalledTimes(2);
  });
});
