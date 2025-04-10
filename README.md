# GitHub Actions Versioner 🔄

[![GitHub Sponsors](https://img.shields.io/github/sponsors/mateuszgorniak?style=for-the-badge)](https://github.com/sponsors/mateuszgorniak)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/mateuszgorniak/github-actions-versioner?style=for-the-badge)](https://github.com/mateuszgorniak/github-actions-versioner/releases)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/mateuszgorniak/github-actions-versioner/ci.yml?style=for-the-badge)](https://github.com/mateuszgorniak/github-actions-versioner/actions)
[![License](https://img.shields.io/github/license/mateuszgorniak/github-actions-versioner?style=for-the-badge)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/mateuszgorniak/github-actions-versioner?style=for-the-badge)](https://github.com/mateuszgorniak/github-actions-versioner/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/mateuszgorniak/github-actions-versioner?style=for-the-badge)](https://github.com/mateuszgorniak/github-actions-versioner/issues)

A GitHub Action that checks if your GitHub Actions dependencies are up to date and suggests updates. 🚀

## ✨ Features

- Scans your workflow files for GitHub Actions dependencies
- Checks the latest available version for each action
- Identifies outdated actions and suggests updates
- Supports both version tags and branch references
- Provides detailed output with file locations and line numbers

## 🔍 Version Checking Behavior

The action checks each unique combination of owner/repo/version separately. This means:

- If you use the same action with different versions (e.g., `actions/checkout@v3` and `actions/checkout@v4`), each version will be checked independently
- The status report will show whether each specific version is up to date
- If a version check fails (e.g., due to network issues or invalid version), you'll see a "version check failed" message
- For each version, the action compares commit SHAs to determine if an update is available
- The report includes all locations where a specific version is used

### Status Messages

- ✅ up to date: The version you're using is the latest available
- ⚠️ update available: A newer version is available (shows current and latest version with their SHAs)
- ❌ version check failed: Could not compare versions (e.g., due to network issues or invalid version)

## 🚀 Quick Start

```yaml
- name: Checkout repository
  uses: actions/checkout@v4

- name: Check GitHub Actions Versions
  uses: mateuszgorniak/github-actions-versioner/actions/versioner@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

## 📋 Configuration

### Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `token` | GitHub token for API access | Yes | - |
| `workflow_path` | Path to workflow files. Can be either absolute (starting with `/`) or relative to the workspace root. | No | `${{ github.workspace }}/.github/workflows` |

### Outputs

| Name | Description |
|------|-------------|
| `status` | Status of the check |
| `outdated_actions` | List of outdated actions |

### Path Handling

The action handles paths in the following way:
- If an absolute path is provided (starting with `/`), it is used as is
- If a relative path is provided, it is joined with the workspace root
- If no path is provided, it defaults to `${{ github.workspace }}/.github/workflows`

## 📊 Example Output

```
Found 5 workflow files
Found 12 action dependencies
Found 8 unique actions

Dependency Report:

actions/checkout@v3 (workflow1.yml:1) - ❌ version check failed - could not compare versions
actions/checkout@v4 (workflow2.yml:2) - ✅ up to date
actions/setup-node@v3 (workflow1.yml:3) - ⚠️ update available: v3 (abc123) -> v4.2.2 (def456)
actions/cache@v2 (workflow2.yml:3) - ⚠️ update available: v2 (123abc) -> v3 (456def)
```

## 🏢 Who's Using This?

We're proud to be used by various organizations and projects. Here are some of them:

- [Your organization/project name here] - Add your organization or project by submitting a PR!

## 🛠️ Development

1. Install dependencies:
   ```bash
   cd actions/versioner
   npm ci
   ```

2. Build the action:
   ```bash
   # Clean previous builds
   rm -rf node_modules dist
   npm cache clean --force

   # Install dependencies
   npm ci

   # Build TypeScript code
   npm run build

   # Package the action with all dependencies
   npm run package

   # Run tests
   npm test
   ```

3. The action is now ready to use. The bundled file will be in `dist/index.js`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security & Privacy

For detailed information about security and privacy, please refer to:
- [Security Policy](SECURITY.md) - Information about security measures, vulnerability reporting, and supported versions
- [Privacy Policy](PRIVACY.md) - Details about data collection, processing, and retention

## ⚠️ Disclaimer

This action is provided "as is" without warranty of any kind, either express or implied. The maintainers of this action are not responsible for any damages or liabilities that may arise from its use.

## 💰 Funding

If you find this project useful and would like to support its development, you can:

- [Sponsor me on GitHub](https://github.com/sponsors/mateuszgorniak) - Support the project with a monthly contribution
- [Star the repository](https://github.com/mateuszgorniak/github-actions-versioner) - Help increase the project's visibility

Your support helps maintain and improve the project. Thank you! 🙏
