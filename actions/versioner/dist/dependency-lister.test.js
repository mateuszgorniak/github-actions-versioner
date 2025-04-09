"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dependency_lister_1 = require("./dependency-lister");
describe('DependencyLister', () => {
    let lister;
    const mockDependencies = [
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            lineNumber: 1,
            filePath: 'workflow1.yml'
        },
        {
            owner: 'actions',
            repo: 'setup-node',
            version: 'v3',
            lineNumber: 2,
            filePath: 'workflow1.yml'
        },
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            lineNumber: 3,
            filePath: 'workflow2.yml'
        }
    ];
    beforeEach(() => {
        lister = new dependency_lister_1.DependencyLister();
    });
    it('should return unique dependencies', () => {
        const result = lister.listUniqueDependencies(mockDependencies);
        expect(result).toHaveLength(2);
        expect(result).toEqual([
            { owner: 'actions', repo: 'checkout', version: 'v3' },
            { owner: 'actions', repo: 'setup-node', version: 'v3' }
        ]);
    });
    it('should handle empty array', () => {
        const result = lister.listUniqueDependencies([]);
        expect(result).toHaveLength(0);
    });
});
