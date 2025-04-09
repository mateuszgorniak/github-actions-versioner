# GitHub Actions Versioner 🔄

A GitHub Action that checks if your GitHub Actions dependencies are up to date and suggests updates. 🚀

## ✨ Features

- Scans your workflow files for GitHub Actions dependencies
- Checks the latest available version for each action
- Identifies outdated actions and suggests updates
- Supports both version tags and branch references
- Provides detailed output with file locations and line numbers

## Usage

```yaml
- name: Check GitHub Actions Versions
  uses: mateuszgorniak/github-actions-versioner@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    workflow_path: .github/workflows  # Optional, defaults to .github/workflows
```

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `token` | GitHub token for API access | Yes | - |
| `workflow_path` | Path to workflow files | No | `.github/workflows` |

## Outputs

| Name | Description |
|------|-------------|
| `status` | Status of the check |
| `outdated_actions` | List of outdated actions |

## Example Output

```
Found 5 workflow files
Found 12 action dependencies
Found 8 unique actions

Dependency Report:
actions/checkout@v2 (workflow.yml:1) - ⚠️ update available: v2 -> v3
actions/setup-node@v3 (workflow.yml:2) - ✅ up to date
actions/cache@v2 (workflow.yml:3) - ⚠️ update available: v2 -> v3
```

## 🛠️ Development

1. Install dependencies:
   ```bash
   cd actions/versioner
   npm install
   ```

2. Build the action:
   ```bash
   npm run build
   npm run package
   ```

3. Run tests:
   ```bash
   npm test
   ```

## 🤔 Who's using this?

- [Your project name here] - Add your project by submitting a PR!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security & Privacy

For detailed information about security and privacy, please refer to:
- [Security Policy](SECURITY.md) - Information about security measures, vulnerability reporting, and supported versions
- [Privacy Policy](PRIVACY.md) - Details about data collection, processing, and retention
