---
name: frontend-design
description: "Enforces production-grade frontend and UI implementation standards for React, Vue, Svelte, HTML, CSS, and Tailwind. Covers visual quality, accessibility (WCAG 2.1 AA), responsive design, dark mode, design systems, and professional polish. Activates when the user builds, modifies, or reviews any user-visible UI component, page, layout, or styling."
---

# Frontend Design Standards

## Scope

This skill applies when:
- Building new UI components, pages, or layouts
- Modifying existing frontend code that affects visual output
- Reviewing frontend code for quality

This skill does NOT apply to:
- CLI tools or terminal-only output
- Backend API responses (JSON, etc.)
- Build tooling or configuration changes with no visual impact

---

## Core Rules

### No Placeholder Content

- Every piece of text must be real, contextually appropriate copy
- No "Lorem ipsum," no "TODO: replace," no "Click here"
- Icons must be meaningful, not decorative filler
- Images must have real alt text describing actual content

**Example — wrong:**
```html
<button>Click here</button>
<img src="photo.jpg" alt="image" />
```

**Example — right:**
```html
<button>Save changes</button>
<img src="photo.jpg" alt="Team photo from Q3 offsite in Portland" />
```

### Professional Visual Quality

- Use a consistent spacing system (4px/8px base or the project's existing scale)
- Typography: establish a clear hierarchy (2-3 font sizes max per view)
- Color: use the project's design tokens; if none exist, define a minimal palette (primary, secondary, neutral, error, success)
- Borders, shadows, and radius values must be consistent across components
- No default browser styling leaking through (focus rings are fine, default margins are not)

### Responsive Design

1. Mobile-first: start with the smallest breakpoint
2. Test at 320px, 768px, 1024px, 1440px minimum
3. No horizontal scrolling at any breakpoint
4. Touch targets minimum 44x44px on mobile
5. Content must reflow, not just scale

### Dark Mode

- Support both light and dark themes via CSS custom properties or the project's theme system
- Never hardcode colors in component styles
- Test contrast ratios in both modes
- Images and icons must remain visible in both modes

---

## Accessibility (WCAG 2.1 AA)

### Mandatory Checks

- All interactive elements must be keyboard accessible
- Tab order must follow visual reading order
- Focus must be visible on every interactive element
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- All images have `alt` text (empty `alt=""` for decorative images)
- Form inputs have associated `<label>` elements
- Error messages are programmatically associated with their inputs
- Page has proper heading hierarchy (h1 > h2 > h3, no skipping)

### Semantic HTML

- Use `<button>` for actions, `<a>` for navigation — never the reverse
- Use `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>` landmarks
- Lists use `<ul>`/`<ol>`, not styled `<div>`s
- Tables use `<th>` with `scope` attributes
- Use ARIA attributes only when semantic HTML is insufficient

### Keyboard Navigation

- All functionality available without a mouse
- `Escape` closes modals and dropdowns
- `Enter`/`Space` activates buttons
- Arrow keys navigate within composite widgets (tabs, menus, lists)
- Focus trap inside modals — Tab cycles within, does not escape to background

---

## Component Standards

### State Handling

Every interactive component must handle these states:
- **default**, **hover**, **focus**, **active**, **disabled**, **loading**, **error**
- Loading states use skeletons or spinners, never blank screens
- Error states show what went wrong AND how to recover
- Empty states explain what goes here and how to populate it

### Animations

- Respect `prefers-reduced-motion` — disable or reduce animations when set
- Transitions under 300ms for UI feedback
- No animation on initial page load that blocks content visibility
- Use CSS transitions over JS animation where possible

### Forms

1. Validate inline on blur, not just on submit
2. Show validation errors next to the relevant field
3. Preserve user input on validation failure
4. Submit buttons show loading state and prevent double-submission
5. Support autofill (proper `name`, `autocomplete` attributes)

---

## Do NOT

- **Do NOT ship placeholder text.** Every string must be real copy.
- **Do NOT use `<div>` with `onClick` instead of `<button>`.** Semantic HTML is mandatory.
- **Do NOT hardcode color values in components.** Use design tokens or CSS custom properties.
- **Do NOT skip mobile testing.** If it does not work at 320px, it is not done.
- **Do NOT ignore `prefers-reduced-motion`.** Users set this for medical reasons.
- **Do NOT use ARIA as a first resort.** Semantic HTML first; ARIA only when HTML is insufficient.
- **Do NOT claim frontend work is complete without running the verification checklist below.**

---

## Verification Checklist

Before marking frontend work complete, verify programmatically where possible and flag remaining items for human review.

**Agent-verifiable:**
1. Keyboard-only navigation works for all interactions
2. No console errors or warnings
3. All text is real content, not placeholder
4. Loading, error, and empty states implemented
5. No hardcoded color values in component styles

**Flag for human review:**
6. Lighthouse accessibility score >= 90
7. Responsive at all standard breakpoints (320px, 768px, 1024px, 1440px)
8. Dark mode renders correctly in both themes
