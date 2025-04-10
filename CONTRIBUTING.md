# 🤝 How to Contribute

Thank you for your interest in our project! Below you'll find information on how you can help with its development.

## 🐛 Reporting Bugs and Proposing Changes

1. Check if the issue hasn't been already reported in [issues](https://github.com/mateuszgorniak/github-actions-versioner/issues)
2. If not, create a new issue describing the problem or proposed change
3. Use the issue template and fill in all required information

## 💻 Local Development

Each action in this repository is self-contained in its own directory under `actions/`. For example, the versioner action is located in `actions/versioner/`.

To work on a specific action:

1. Navigate to the action's directory:
   ```bash
   cd actions/versioner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Make your changes

5. Build the action:
   ```bash
   npm run build
   npm run package
   ```

6. Ensure everything works correctly (see Code Requirements section below)

## 📋 Code Requirements

- Code should follow the existing style
- Every new feature should be covered by tests
- Documentation should be updated along with changes

## 🔄 Contribution Process

1. Fork the repository
2. Create a new branch for your changes (`git checkout -b feature/amazing-feature`)
3. Follow the Local Development steps above
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push your changes (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## ❓ Questions?

If you have any questions, feel free to open an issue or contact the maintainers.
