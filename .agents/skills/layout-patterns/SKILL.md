---
name: layout-patterns
description: Guidelines for responsive layout architecture, Bento grids, skeletal loaders, and interactive form UX patterns.
---

# Layout & Component Architecture Guidelines

Use these structure patterns to build consistent, clean, and highly readable page layout modules.

## 1. M3 Card Layouts & Bento Grids
In Material 3, Cards are the primary containers for content. Bento grids use these cards to establish clean visual weight:
* **Grid Setup:** Use a flexible CSS Grid:
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-2 p-8 rounded-3xl bg-secondary-light border border-white/5">Large content</div>
    <div className="md:col-span-1 p-8 rounded-3xl bg-secondary-light border border-white/5">Small content</div>
  </div>
  ```
* **Styling Card Content:** Every card in a Bento grid should maintain internal padding consistency (`p-6` to `p-8`) and feature rounded corners (`rounded-3xl`).

## 2. Skeleton Loaders (Visual Feedback)
Avoid generic spinners; use skeletons that preview the content's final structure:
* **Skeleton Cards:** Build skeleton cards that match the target layout.
* **Color Tone:** Use the local theme colors. In dark mode, pulse between `secondary-light` and `secondary-dark`:
  ```tsx
  <div className="animate-pulse bg-secondary-light rounded-2xl h-48 w-full" />
  ```
* **Text Lines:** Build multi-line text skeletons with varying widths (e.g., one line at `w-3/4`, another at `w-1/2`) to simulate natural paragraph lines.

## 3. Responsive Premium Forms (M3 Outlined Inputs)
* **Spacing:** Group forms with standard vertical space (e.g., `space-y-6`).
* **M3 Outlined Inputs Style:** Form inputs should follow the M3 Outlined text field style. Use fully rounded corners (`rounded-xl` or `rounded-2xl`) and clear focus states:
  * Style: `w-full px-4 py-3 rounded-xl border border-white/10 bg-secondary-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`.
* **Inline Errors:** Render validation errors dynamically under the input fields in the standard M3 error color (e.g., `text-red` o `text-[#f2b8b5]` in dark mode).

## 4. Top App Bar & Navigation (M3)
* **Top App Bar:** Keep the main navigation fixed to the top. While M3 uses solid color shifts on scroll, for a premium web feel, a blurred overlay is acceptable:
  * Style: `sticky top-0 z-50 backdrop-blur-md bg-secondary/80 border-b border-white/5`.
* **Dropdown Menus (Menus & Dialogs):** Set explicit widths, animations, and shadows on menu wrappers following M3 dialog geometry (`shadow-two` + `rounded-2xl` or `rounded-3xl`).
