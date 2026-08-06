---
name: responsive-design
description: Guidelines for mobile-first responsive design, adaptive layouts, fluid spacing, and touch interactions.
---

# Responsive & Adaptive Design Guidelines

Use these principles to ensure that every page and component scales perfectly from mobile screens to large desktop monitors.

## 1. Mobile-First Development Philosophy
Always build and style components starting from the mobile view (default Tailwind classes) and layer on larger screen modifiers as needed:
* **Rule:** Write styles for mobile first, then add modifiers like `md:`, `lg:`, etc.
* **Example:** `w-full md:w-1/2 lg:w-1/3` instead of starting with desktop sizes and trying to reduce them.

## 2. Breakpoints & Screen Sizes
This project utilizes custom breakpoints defined in `src/styles/index.css`:
* `xs:` (450px) - Large phones / extra-small views.
* `sm:` (575px) - Small tablets / landscape phones.
* `md:` (768px) - Tablets (IPad portrait, etc.).
* `lg:` (992px) - Laptops / desktop standard.
* `xl:` (1200px) - Large desktops.
* `2xl:` (1400px) - Ultra-wide displays.

## 3. Responsive Containers & Spacing
* **Max-Width Wrappers:** Never let content span infinitely on ultra-wide screens. Wrap pages in constrained containers:
  * Style: `w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
* **Dynamic Padding & Gap:** Scale layout spaces dynamically:
  * Section padding: `py-10 md:py-20 lg:py-32`.
  * Grid spacing: `gap-4 md:gap-6 lg:gap-8`.

## 4. Fluid Typography & Interactive Touch Targets
* **Readable Sizes:** Adjust headings dynamically so they look bold on desktop but don't clip on mobile:
  * Title: `text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold`.
* **Mobile Touch Targets:** On touchscreens, buttons and interactive links must be easy to tap:
  * Keep buttons at a minimum height of `44px` (e.g., `py-3 px-6`).
  * Ensure adequate spacing between interactive elements to prevent accidental taps (e.g., `space-y-4` or `gap-3`).

## 5. Flexbox & Grid Conversions
* **Grid Wrapping:** Convert grids to single-column automatically on smaller screens:
  * Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.
* **Flex Wrapping:** Let layouts stack vertically and expand horizontally when space permits:
  * Flex layout: `flex flex-col md:flex-row items-start md:items-center justify-between`.
