import { run } from './index';

describe('GitHub Actions Versioner', () => {
  it('should run without errors', async () => {
    await expect(run()).resolves.not.toThrow();
  });
});
