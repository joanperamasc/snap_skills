---
name: tailwindcss
description: Styling guidelines and variables for Tailwind CSS v4 in Peramas.com
---

# Tailwind CSS v4 Guidelines

This project uses Tailwind CSS v4.1.4 with PostCSS. Configurations are defined natively inside the CSS using `@theme` syntax instead of `tailwind.config.js`.

## 1. Local Design Tokens (`@theme` Variables)
Use these custom theme values defined in `src/styles/index.css`:

### Colors
Use these custom colors as classes (e.g., `text-primary`, `bg-secondary-light`):
* **Primary (Accent Green):** `primary` (`#87e64b`), `primary-dark` (`rgb(115,196,64)`), `primary-light` (`#a5ec78`)
* **Secondary (Dark slate/gray theme):** `secondary` (`#1c212a`), `secondary-light` (`#262c36`), `secondary-dark` (`#13161c`)
* **Tertiary (Cream colors):** `tertiary` (`#fff5ed`), `tertiary-light` (`#fff9f3`), `tertiary-dark` (`#fff9f3`)
* **Standard Status Colors:** `yellow` (`#ffc107`), `red` (`#ff4d4f`), `body-color` (`rgba(0, 0, 0, 0.5)`)

### Custom Animations
Apply these utility classes for micro-animations:
* `animate-float-slow` - Float animation (8s slow loop)
* `animate-float-medium` - Float animation (6s loop)
* `animate-float-fast` - Float animation (5s loop)
* `animate-shine` - Linear shine gradient effect (2s loop)
* `animate-scan` - Vertical scanline movement (2s loop)
* `animate-fade-in-up` - Smooth fade in and slide up from bottom (0.5s)

### Custom Utilities
* `bg-gradient-text-primary` - Apply primary-to-light-green text gradient
* `bg-gradient-section-main` - Ambient radial and linear green/black gradient for main pages
* `checkered-bg` - Gray and white checkers pattern for visual previews
* `quick-access-img` - Preset brightness/contrast filters with hover transitions

## 2. Best Practices for Tailwind v4
* **Theme variables:** Since `@theme` defines CSS custom variables natively, classes are derived from these variables (e.g., `--color-primary` enables `bg-primary`, `text-primary`, `border-primary`, etc.).
* **Dark Mode:** Dark mode is explicitly set to use the class-based selector `@variant dark (&:where(.dark, .dark *));`. Always design for dark mode by utilizing the prefix `dark:` (e.g., `bg-white dark:bg-secondary`).
* **Typography:** Tailwind CSS Typography plugin is imported via `@plugin "@tailwindcss/typography";` and provides the `.prose` class for styling rich text (Markdown rendered elements).
* **Avoid Hardcoded Colors:** Try to use the predefined design tokens instead of hardcoded hex values to maintain UI consistency across the site.
