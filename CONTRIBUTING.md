# Contributing to SnapSkills

First off, thank you for considering contributing to SnapSkills! It's people like you that make SnapSkills such a great tool.

## Code of Conduct
By participating in this project, you are expected to uphold a welcoming, collaborative, and inclusive environment.

## How Can I Contribute?

### Reporting Bugs
If you find a bug, please create an Issue on GitHub with the following details:
- A clear and descriptive title.
- Steps to reproduce the issue.
- Expected behavior vs. actual behavior.
- Browser version (e.g., Chrome 116).

### Suggesting Enhancements
Ideas for new features are highly welcome! Please create an Issue explaining:
- The problem your feature solves.
- How the feature should work.
- Why this enhancement would be useful to most users.

### Pull Requests (PRs)
We are thrilled to receive your Pull Requests with new code. Since our `main` branch is protected, this is the mandatory workflow:

1. **Fork** the repository to your account and create your own branch from `main` (e.g., `git checkout -b feature/my-new-idea`).
2. **Install dependencies**: run `npm install`.
3. **Make your changes**: ensure your code adheres to the project's style (React 19, Vite, Tailwind CSS v4, Chrome Extension MV3, next-intl).
4. **Test your changes**: Build the extension (`npm run build`) and test it locally on Chrome by loading the `dist` folder.
5. **Create the PR**: Ensure your PR description clearly describes the problem and solution using our template.

## Project Setup (Local Development)
To get started with local development, follow these steps in your terminal:

```bash
git clone https://github.com/joanperamasc/snap_skills.git
cd snap_skills
npm install
npm run build
```
Then load the *unpacked* extension from `chrome://extensions/`.

Thank you for your contributions!
