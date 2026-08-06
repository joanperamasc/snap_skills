---
name: motion-effects
description: Guidelines for implementing advanced visual animations, ambient background glows, and modern interactive effects.
---

# Motion & Visual Effects Guidelines

To achieve a high-end, premium SaaS aesthetic, incorporate these guidelines for animations, ambient effects, and motion design.

## 1. Ambient Glows (Glows & Radial Highlights)
* **Background Blurs:** Create modern depth by placing large, low-opacity colored circles behind content.
  * Use classes like: `absolute w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none`.
  * Position these blobs at corner boundaries or behind CTA sections to draw subtle focus.
* **Ambient Overlays:** Use linear and radial gradient backgrounds that gently transition (e.g. `bg-gradient-section-main` utility) instead of flat dark/light backgrounds.

## 2. Animated Borders & Highlighting
* **Active Border States:** Use borders with gradients or high contrast colors on focus. For example, in dark mode: `border border-white/5 focus-within:border-primary/50`.
* **Shine Effects:** Utilize the `animate-shine` animation on headers, icons, or primary cards to create a glossy, reflective light sweep across the element.
* **Scanline Effect:** Apply the `animate-scan` animation inside loading states or AI dashboard elements to simulate active background processing or telemetry.

## 3. M3 Micro-Interactions & State Layers
* **Hover State Layers:** Material 3 uses "State Layers" instead of just shadows. When hovering over cards or buttons, change the background tone slightly (e.g., `hover:bg-secondary-light` over `bg-secondary-dark`) to simulate a state layer.
* **Element Elevating:** If applying elevation on hover, combine the tonal shift with a very soft shadow:
  * Apply `transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-two`.
* **Button Feedback (Ripple Alternative):** To emulate M3's touch ripple without complex JS, use quick scale and brightness shifts on active state:
  * Use `transition-all duration-200 active:scale-95 active:brightness-90 hover:brightness-110`.

## 4. Scroll & Entrance Animations
* **Fade In Upwards:** When lazy-loading sections or client lists, apply `animate-fade-in-up` to make the entrance smooth.
* **Controlled Delays:** Stagger list entries or grid cards with staggered animation delays (e.g., `animation-delay-100`, `animation-delay-200`) so elements do not pop in simultaneously.
