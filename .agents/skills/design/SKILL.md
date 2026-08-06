---
name: design
description: Design principles for clean, Google-inspired layouts and micro-interactions in Peramas.com
---

# Google-Inspired Premium Design System Guidelines

These guidelines describe the design system for creating premium, modern, clean, and interactive interfaces, inspired by Google's web products and Material Design.

## 1. Core Principles (Google-Inspired Aesthetics)

- **Breathing Room & Whitespace:** Use generous margins and paddings. Avoid cramped layouts. Give elements room to breathe.
- **Modern Geometry (Rounded Corners):** Use highly rounded elements (`rounded-2xl`, `rounded-3xl`) for cards, dialogs, and panels to create a soft, friendly look. Primary Action Buttons (CTAs) should be pill-shaped (`rounded-full`) following M3 guidelines.
- **Tonal Elevation & Subtle Depth (M3 Style):** Define hierarchy using "Tonal Elevation" in addition to shadows. Use subtly warmer/darker backgrounds (`bg-tertiary`, `bg-secondary-light`) over the base background to differentiate layers before resorting to heavy shadows. When using shadows (`shadow-one`, `shadow-two`), keep them ultra-soft.
- **Glassmorphism (Premium Hybrid):** While M3 prefers solid tonal colors, for an extra modern touch on sticky headers or menus, use `backdrop-blur-md` with semi-transparent backgrounds (e.g., `bg-secondary/80` or `bg-white/80`).

## 2. Color Scheme Application

Always style elements using the base color tokens to maintain consistency between light and dark modes:

- **Backgrounds:**
  - Light Mode: Pure white (`bg-white`), cream/tertiary (`bg-tertiary` / `bg-tertiary-light`), or light gray.
  - Dark Mode: Pure dark/black (`bg-dark` / `bg-black`) or deep slate (`bg-secondary` / `bg-secondary-dark`).
- **Accents (Material 3 Touch):**
  - Use the vivid green `primary` (`#87e64b`) strategically. For a true M3 feel, combine it with "Containers": use a light primary variant for a background and a dark primary for the text inside it.
  - Action buttons (CTAs) should ideally be pill-shaped (`rounded-full`). **Size matters:** Keep button padding and text sizes balanced and elegant (e.g., `px-6 py-2.5 text-sm` or `px-4 py-2 text-sm`). Avoid excessively large buttons with huge padding or text sizes unless it's a massive hero section.
  - Use `bg-gradient-text-primary` for prominent headlines to draw visual attention.
- **Borders:**
  - Use thin borders with low opacity (e.g., `border-black/5` in light mode, `border-white/10` in dark mode) instead of thick solid borders to separate sections cleanly.

## 3. Premium Micro-Interactions & Transitions

- **Hover States:** All interactive elements (buttons, links, cards, list items) MUST have visible hover states with smooth transitions.
  - Use `transition-all duration-300 ease-in-out` or `duration-200`.
  - Add subtle translations on hover, e.g., `hover:-translate-y-1 hover:shadow-two` for cards, or `hover:scale-[1.02]` for action buttons.
- **Animations:**
  - Use float animation utilities (`animate-float-slow` / `animate-float-medium`) for background shapes, ambient blur elements, or illustrations.
  - Use `animate-fade-in-up` for new content segments, forms, or loaded images to prevent jarring visual pops.
  - Use `animate-shine` and `animate-scan` for loading skeletons or premium interactive overlays.

## 4. Typography Hierarchy & Accessibility (M3 Standard)

- **Font:** "Inter" sans-serif (weights 100-900), providing a clean, "Google Sans" feel.
- **Headings:** Use bold/extra-bold (`font-bold`, `font-extrabold`) for headers. Keep headings readable with correct line-height (`leading-tight` or `leading-snug`). **Avoid Exaggerated Sizes:** Stick to balanced typography scales (e.g., `text-xl`, `text-2xl`, `text-3xl`, `text-4xl` for major page titles). Do not use excessively large text (like `text-6xl` or `text-7xl`) unless you are designing a primary landing page Hero section.
- **Body/Descriptions (High Contrast):** Emulate M3's "On-Surface Variant" by using solid, high-contrast grays in light mode for better anti-aliasing and WCAG compliance (`text-body-color`). In dark mode, if using Glassmorphism cards, `text-white/70` is preferred as it naturally blends with the ambient glows behind the translucent cards.
