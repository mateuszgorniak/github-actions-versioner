# Privacy Policy 🔒

This document outlines the privacy practices for the GitHub Actions Versioner.

## Data Collection and Usage

The GitHub Actions Versioner:
- Does not collect or store any personal information
- Only accesses public GitHub API endpoints
- Does not transmit any data to external services
- Only processes workflow files within your repository
- Does not log or store any sensitive information
- Processes each version of GitHub Actions independently
- Verifies commit SHAs for version comparison
- Maintains references to file locations where actions are used

## GitHub API Usage

The action uses GitHub's public API to:
- Read workflow files from your repository
- Check for the latest versions of GitHub Actions
- Verify commit SHAs for specific versions
- No write operations are performed on your repository
- All API calls are authenticated and rate-limited
- Failed API calls are handled without storing error details

## Data Processing

The action processes the following data:
- Workflow file contents (in memory only)
- GitHub Actions version information
- Commit SHAs for version verification
- File locations and line numbers where actions are used
- All data is processed in memory and not persisted

## Data Storage

No data is stored or persisted by this action. All processing is done in memory during the workflow execution.

## Changes to This Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## Contact Us

If you have any questions about this Privacy Policy, please open an issue in this repository.
