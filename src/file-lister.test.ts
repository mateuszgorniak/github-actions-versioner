import { FileLister } from './file-lister';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('FileLister', () => {
  let fileLister: FileLister;
  const mockWorkflowPath = '.github/workflows';
  const mockFiles = ['test1.yml', 'test2.yml', 'not-a-workflow.txt'];

  beforeEach(() => {
    fileLister = new FileLister();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error when workflow directory does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    expect(() => fileLister.listWorkflowFiles()).toThrow('Workflow directory not found');
  });

  it('should return only .yml and .yaml files', () => {
    const files = fileLister.listWorkflowFiles();
    expect(files).toHaveLength(2);
    expect(files[0]).toBe(path.join(mockWorkflowPath, 'test1.yml'));
    expect(files[1]).toBe(path.join(mockWorkflowPath, 'test2.yml'));
  });

  it('should use custom base path when provided', () => {
    const customPath = 'custom/path';
    fileLister = new FileLister({ basePath: customPath });
    fileLister.listWorkflowFiles();
    expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(customPath));
  });

  it('should use absolute path as is when provided', () => {
    const absolutePath = '/home/runner/work/repo/.github/workflows';
    fileLister = new FileLister({ basePath: absolutePath });
    fileLister.listWorkflowFiles();
    expect(fs.existsSync).toHaveBeenCalledWith(absolutePath);
  });

  it('should handle relative path by joining with cwd', () => {
    const relativePath = 'custom/path';
    fileLister = new FileLister({ basePath: relativePath });
    fileLister.listWorkflowFiles();
    expect(fs.existsSync).toHaveBeenCalledWith(path.join(process.cwd(), relativePath));
  });

  it('should handle default path by joining with cwd', () => {
    fileLister.listWorkflowFiles();
    expect(fs.existsSync).toHaveBeenCalledWith(path.join(process.cwd(), '.github/workflows'));
  });
});
