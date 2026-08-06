---
name: i18n
description: Guidelines for managing internationalization (English and Spanish) using next-intl.
---

# Internationalization (i18n) Guidelines

This project supports multiple languages (currently English and Spanish) using `next-intl`. All AI agents must follow these rules when adding or modifying text in the UI.

## 1. Using Translations in Components
* **Always use `next-intl`**: Never hardcode user-facing text strings directly in the UI components. Use the `useTranslations` hook from `next-intl`.
* **Component Usage Example**:
  ```tsx
  import { useTranslations } from "next-intl";

  export default function MyComponent() {
    const t = useTranslations("Pages.MyPage");
    return <h1>{t("title")}</h1>;
  }
  ```

## 2. Translation Files (JSON)
* Translation dictionaries are stored in the `messages/` directory (e.g., `messages/en.json` y `messages/es.json`).
* **Consistency is CRITICAL**: Whenever you add, modify, or delete a translation key in `en.json`, you MUST mirror that exact change in `es.json` to prevent runtime missing-translation errors.
* **Namespace Hierarchy**: Group translation keys logically by their domain:
  * `Pages.*` for page-specific text (e.g., `Pages.Profile`).
  * `Components.*` for reusable components (e.g., `Components.Errors`).
  * `Common.*` for generic terms used across the app (e.g., "Accept", "Cancel", "Loading").

## 3. Dynamic Values in Translations
* Pass dynamic variables within curly braces in the JSON file:
  * JSON: `"greeting": "Hello, {name}!"`
  * Component: `t("greeting", { name: user.name })`
