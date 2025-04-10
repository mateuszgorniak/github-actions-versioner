"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dependency_lister_1 = require("./dependency-lister");
describe('DependencyLister', () => {
    let lister;
    const mockDependencies = [
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v4',
            lineNumber: 1,
            filePath: 'workflow1.yml'
        },
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v4',
            lineNumber: 2,
            filePath: 'workflow2.yml'
        },
        {
            owner: 'actions',
            repo: 'checkout',
            version: 'v3',
            lineNumber: 3,
            filePath: 'workflow3.yml'
        },
        {
            owner: 'actions',
            repo: 'setup-node',
            version: 'v3',
            lineNumber: 4,
            filePath: 'workflow1.yml'
        }
    ];
    beforeEach(() => {
        lister = new dependency_lister_1.DependencyLister();
    });
    it('should list unique dependencies with their references', () => {
        const result = lister.listUniqueDependencies(mockDependencies);
        expect(result).toHaveLength(3);
        // Check actions/checkout@v4
        const checkoutV4 = result.find(d => d.owner === 'actions' && d.repo === 'checkout' && d.version === 'v4');
        expect(checkoutV4).toBeDefined();
        expect(checkoutV4 === null || checkoutV4 === void 0 ? void 0 : checkoutV4.references).toHaveLength(2);
        expect(checkoutV4 === null || checkoutV4 === void 0 ? void 0 : checkoutV4.references).toContainEqual({ filePath: 'workflow1.yml', lineNumber: 1 });
        expect(checkoutV4 === null || checkoutV4 === void 0 ? void 0 : checkoutV4.references).toContainEqual({ filePath: 'workflow2.yml', lineNumber: 2 });
        // Check actions/checkout@v3
        const checkoutV3 = result.find(d => d.owner === 'actions' && d.repo === 'checkout' && d.version === 'v3');
        expect(checkoutV3).toBeDefined();
        expect(checkoutV3 === null || checkoutV3 === void 0 ? void 0 : checkoutV3.references).toHaveLength(1);
        expect(checkoutV3 === null || checkoutV3 === void 0 ? void 0 : checkoutV3.references).toContainEqual({ filePath: 'workflow3.yml', lineNumber: 3 });
        // Check actions/setup-node@v3
        const setupNode = result.find(d => d.owner === 'actions' && d.repo === 'setup-node' && d.version === 'v3');
        expect(setupNode).toBeDefined();
        expect(setupNode === null || setupNode === void 0 ? void 0 : setupNode.references).toHaveLength(1);
        expect(setupNode === null || setupNode === void 0 ? void 0 : setupNode.references).toContainEqual({ filePath: 'workflow1.yml', lineNumber: 4 });
    });
    it('should handle empty dependencies array', () => {
        const result = lister.listUniqueDependencies([]);
        expect(result).toHaveLength(0);
    });
});
