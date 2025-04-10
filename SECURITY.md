# Security Policy 🛡️

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Security Measures

The GitHub Actions Versioner implements the following security measures:
- Uses GitHub's official API endpoints
- All API calls are made using the provided `GITHUB_TOKEN`
- No external dependencies are required
- Runs entirely within GitHub's infrastructure
- Regular security updates are applied to dependencies
- Verifies commit SHAs for each specific version of an action
- Handles version checking failures gracefully with clear error messages
- Maintains separate checks for different versions of the same action

## API Security

The action uses the following GitHub API endpoints securely:
- `GET /repos/{owner}/{repo}/tags` - to fetch the latest version
- `GET /repos/{owner}/{repo}/git/ref/{ref}` - to verify commit SHAs
- All API calls are rate-limited and authenticated
- Failed API calls are handled with appropriate error messages
- Network errors and invalid versions are reported clearly

## Reporting a Vulnerability

We take the security of our software seriously. If you believe you've found a security vulnerability, please follow these steps:

1. Do not disclose the vulnerability publicly until it has been addressed by our team
2. Submit a security advisory through GitHub's security advisory system
3. Provide detailed information about the vulnerability
4. Include steps to reproduce the issue

## Security Updates

We regularly:
- Update dependencies to their latest secure versions
- Review and audit the codebase for potential security issues
- Monitor GitHub's security advisories for related vulnerabilities
- Test version checking behavior with different action formats
- Verify SHA comparison logic for accuracy

## Security Contact

For security-related issues, please use GitHub's security advisory system in this repository.
