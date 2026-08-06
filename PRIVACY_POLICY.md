# Privacy Policy for SnapSkills

**Effective Date:** August 6, 2026

SnapSkills ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our Chrome Extension, SnapSkills, handles your data.

## 1. Data Collection and Storage
SnapSkills is designed with a privacy-first approach. We **do not** collect, store, or transmit your personal data to our servers.

*   **Local Storage:** All your data, including saved skills, search history, custom skills you create, and application settings (like language and theme), are saved locally on your device using Chrome's local storage (`chrome.storage.local`).
*   **No Telemetry:** We do not track your usage, clicks, or any analytics.

## 2. GitHub Integration and Personal Access Token (PAT)
SnapSkills interacts with the public GitHub API (`api.github.com` and `raw.githubusercontent.com`) to search and fetch Markdown files (skills) from our repository.

*   **GitHub Token:** You have the option to provide a GitHub Personal Access Token (PAT) to increase the API rate limit. If you choose to provide a PAT, it is **stored securely and locally** on your device. It is only sent directly to GitHub's API to authenticate your requests. We do not have access to your PAT, nor is it ever sent to our servers or any third parties.

## 3. Interaction with AI Chat Platforms
SnapSkills requires permissions to interact with specific websites (ChatGPT, Claude, and Gemini) via content scripts and tab permissions.

*   **No Monitoring:** SnapSkills **does not** read, monitor, or record your conversations on these platforms.
*   **User-Initiated Action:** The extension only interacts with the DOM (injecting text into the chat input field) when you explicitly click the "Copy" or "Inject" buttons within the extension's side panel.

## 4. Permissions Justification
To function correctly, SnapSkills requires the following permissions:
*   `sidePanel`: To display the extension's user interface alongside your browsing experience.
*   `storage`: To save your preferences, custom skills, search history, and GitHub PAT locally on your device.
*   `tabs` & `scripting`: To determine if you are on a supported AI chat platform and to inject the selected skill text into the prompt input field.
*   `Host Permissions` (`*://chatgpt.com/*`, `*://claude.ai/*`, `*://gemini.google.com/*`): Required to interact with the input fields on these specific platforms.
*   `Host Permissions` (`https://api.github.com/*`, `https://raw.githubusercontent.com/*`): Required to fetch the open-source skill library from GitHub.

## 5. Changes to This Privacy Policy
We may update our Privacy Policy from time to time. Any changes will be reflected in this document, and the "Effective Date" at the top will be updated. We encourage you to review this Privacy Policy periodically for any changes.

## 6. Contact Us
If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at [info@peramas.com](mailto:info@peramas.com) or open an issue on our [GitHub repository](https://github.com/joanperamasc/snap_skills).
