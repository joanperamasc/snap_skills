# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-07
### Added
- **Chrome Built-in AI Integration**: Added an experimental "Improve with AI" (Wand2) button in the Markdown editor. Uses `window.ai.languageModel` (Gemini Nano) to automatically enhance skill descriptions entirely on-device.
- **Robust Undo/Redo System**: The editor now features an advanced local history stack that seamlessly tracks manual typing (debounced) and AI replacements, allowing users to safely undo/redo changes.
- **Advanced Search**: New dropdown filter panel to narrow searches by user, repository, and specific path.
- **Ludic Empty State**: Added a "Hacker Cat" ASCII animation for empty loading states and zero-result searches.
- **Smart Caching**: Implemented a 15-minute cache (using `chrome.storage.session`) to prevent redundant API calls and protect rate limits.
- **Custom Tooltips**: Added Dark Mode compatible visual tooltips to explain advanced search fields.
- **Pagination**: Support for loading multiple pages of GitHub results on scroll.

### Changed
- **Strict Filter**: The "snapskill" keyword restriction is now disabled by default, allowing new users to discover any free `SKILL.md` on GitHub.
- **Error Handling (CORS/Rate Limits)**: Improved the Service Worker to catch GitHub 403 errors and display a clear message in the UI.

## [1.0.0] - 2026-08-01
### Added
- Initial release.
- Support for creating AI skills.
- Markdown editor with syntax highlighting.
- Multilingual support (Spanish/English).
- Light and Dark modes.
