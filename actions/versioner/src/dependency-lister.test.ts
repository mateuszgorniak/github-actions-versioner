import { DependencyLister } from './dependency-lister';
import { ActionDependency } from './dependency-analyzer';

describe('DependencyLister', () => {
  let lister: DependencyLister;
  const mockDependencies: ActionDependency[] = [
    {
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      lineNumber: 1,
      filePath: 'workflow1.yml'
    },
    {
      owner: 'actions',
      repo: 'checkout',
      version: 'v3',
      lineNumber: 2,
      filePath: 'workflow2.yml'
    },
    {
      owner: 'actions',
      repo: 'setup-node',
      version: 'v3',
      lineNumber: 3,
      filePath: 'workflow1.yml'
    },
    {
      owner: 'actions',
      repo: 'setup-node',
      version: 'v4',
      lineNumber: 4,
      filePath: 'workflow2.yml'
    }
  ];

  beforeEach(() => {
    lister = new DependencyLister();
  });

  it('should return unique dependencies', () => {
    const result = lister.listUniqueDependencies(mockDependencies);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { owner: 'actions', repo: 'checkout' },
      { owner: 'actions', repo: 'setup-node' }
    ]);
  });

  it('should handle empty array', () => {
    const result = lister.listUniqueDependencies([]);
    expect(result).toHaveLength(0);
  });
});
