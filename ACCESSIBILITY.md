# Accessibility Guidelines & Testing

## Overview

This document outlines the accessibility standards, features, and testing procedures for the Krishiraksha application. Our goal is to maintain an accessibility score **above 90%** using Lighthouse and axe DevTools.

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

We aim to meet or exceed **WCAG 2.1 Level AA** standards across all pages and components.

#### Key Principles (POUR)

1. **Perceivable** - Information must be presentable to users in ways they can perceive
2. **Operable** - Interface components must be operable by all users
3. **Understandable** - Information and operation must be understandable
4. **Robust** - Content must be robust enough to be interpreted by assistive technologies

---

## Implemented Accessibility Features

### 1. Semantic HTML

All pages use proper semantic HTML5 elements:

- `<header>` - Page/section headers
- `<nav>` - Navigation menus
- `<main>` - Main content area
- `<section>` - Thematic groupings
- `<article>` - Self-contained content (e.g., batch cards)
- `<aside>` - Sidebar content
- `<footer>` - Page/section footers
- `<form>` - All form elements

**Example:**
```tsx
<main className="safe-area px-4">
  <section aria-labelledby="dashboard-heading">
    <h2 id="dashboard-heading">Dashboard</h2>
    {/* Content */}
  </section>
</main>
```

### 2. ARIA Labels and Roles

#### Input Fields
- `aria-label` - Descriptive labels for inputs
- `aria-required` - Marks required fields
- `aria-invalid` - Indicates validation errors
- `aria-describedby` - Links to error messages

**Example:**
```tsx
<Input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <div role="alert" id="email-error">
    {errors.email}
  </div>
)}
```

#### Interactive Elements
- Buttons have `aria-label` for icon-only buttons
- Icons use `aria-hidden="true"` when decorative
- Links have descriptive text or `aria-label`

#### Dialogs & Modals
- `role="dialog"` - Identifies modal dialogs
- `aria-modal="true"` - Indicates modal behavior
- `aria-labelledby` - Points to dialog title
- `aria-describedby` - Points to dialog description (if applicable)

**Example:**
```tsx
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="add-batch-heading"
>
  <h2 id="add-batch-heading">Add New Batch</h2>
  {/* Dialog content */}
</div>
```

#### Status Messages
- `role="alert"` - For error messages
- `role="status"` - For success messages
- `aria-live="polite"` - For dynamic content updates

### 3. Keyboard Navigation

All interactive elements are fully keyboard accessible.

#### Custom Hooks

We've implemented custom hooks for keyboard navigation in `src/hooks/useKeyboardNavigation.ts`:

- **`useEscapeKey`** - Closes modals/dialogs with ESC key
- **`useFocusTrap`** - Traps focus within modals (Tab/Shift+Tab cycling)
- **`useRestoreFocus`** - Restores focus when closing modals
- **`useArrowNavigation`** - Arrow key navigation for lists/menus
- **`useClickableKey`** - Enter/Space activation for custom elements

#### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate forward through interactive elements |
| `Shift + Tab` | Navigate backward through interactive elements |
| `Enter` | Activate buttons, links, and form submissions |
| `Space` | Toggle checkboxes, activate buttons |
| `Esc` | Close modals and dialogs |
| `↑ ↓ ← →` | Navigate through lists (when applicable) |

**Example Usage:**
```tsx
const AddBatchForm = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEscapeKey(() => setShowAddBatch(false), showAddBatch);
  useFocusTrap(modalRef, showAddBatch);
  useRestoreFocus(showAddBatch);

  return (
    <div role="dialog" aria-modal="true">
      <div ref={modalRef}>
        {/* Modal content */}
      </div>
    </div>
  );
};
```

### 4. Focus Management

- **Visible Focus Indicators** - All focusable elements have clear focus styles
- **Logical Tab Order** - Tab order follows visual layout
- **Focus Trapping** - Focus stays within modals until closed
- **Skip Links** - (Recommended) Add skip-to-content links for keyboard users

### 5. Color & Contrast

- **Minimum Contrast Ratios:**
  - Normal text: 4.5:1
  - Large text: 3:1
  - UI components: 3:1

- **Color is not the only indicator** - Icons, labels, and text accompany color coding

### 6. Forms & Validation

- **Labels** - All inputs have associated `<label>` elements
- **Required Fields** - Marked with `*` and `aria-required="true"`
- **Error Messages** - Clear, descriptive, linked via `aria-describedby`
- **Real-time Validation** - Errors shown as user types
- **Autocomplete** - Proper autocomplete attributes (`email`, `current-password`)

### 7. Alternative Text

- **Images** - All images have descriptive `alt` text
- **Icons** - Decorative icons use `aria-hidden="true"`
- **Icon Buttons** - Use `aria-label` to describe action
- **SVG** - SVG icons include `role="img"` and `aria-label` when meaningful

**Example:**
```tsx
{/* Decorative icon */}
<Sprout className="w-6 h-6" aria-hidden="true" />

{/* Meaningful icon button */}
<Button aria-label="Add new batch">
  <Plus className="w-6 h-6" aria-hidden="true" />
</Button>

{/* Image with alt text */}
<img src="/logo.png" alt="Krishiraksha logo - Farm to fork transparency" />
```

### 8. Mobile Accessibility

- **Touch Targets** - Minimum 44x44px for all interactive elements
- **Gestures** - Alternatives provided for complex gestures
- **Orientation** - Works in both portrait and landscape
- **Zoom** - Content remains readable at 200% zoom

---

## Testing Procedures

### 1. Automated Testing with Lighthouse

#### Running Lighthouse (Chrome DevTools)

1. Open Chrome DevTools (`F12` or `Ctrl+Shift+I`)
2. Navigate to **Lighthouse** tab
3. Select categories: **Accessibility**, Performance, Best Practices, SEO
4. Choose device: **Mobile** or **Desktop**
5. Click **Analyze page load**

#### Target Scores
- **Accessibility: ≥ 90** (Goal: 95+)
- Performance: ≥ 80
- Best Practices: ≥ 90
- SEO: ≥ 90

#### Common Lighthouse Issues & Fixes

| Issue | Fix |
|-------|-----|
| Missing alt attributes | Add descriptive `alt` text to all `<img>` tags |
| Low contrast text | Increase color contrast to meet 4.5:1 ratio |
| Missing form labels | Ensure all inputs have associated `<label>` elements |
| Missing ARIA attributes | Add `aria-label`, `aria-describedby`, etc. |
| Heading order issues | Use h1 → h2 → h3 hierarchy properly |

### 2. Automated Testing with axe DevTools

#### Installation

```bash
npm install --save-dev @axe-core/react axe-core
```

#### Setup in Development

Add to `src/main.tsx` (development only):

```tsx
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

#### Running axe DevTools (Browser Extension)

1. Install **axe DevTools** Chrome extension
2. Open DevTools → **axe DevTools** tab
3. Click **Scan ALL of my page**
4. Review issues by severity: Critical, Serious, Moderate, Minor

#### Interpreting Results

- **Critical** - Fix immediately (blocks screen readers)
- **Serious** - Fix soon (major barriers)
- **Moderate** - Fix when possible (minor barriers)
- **Minor** - Enhancement opportunities

### 3. Manual Keyboard Testing

Test all pages with keyboard only (no mouse):

#### Checklist

- [ ] **Tab through all elements** - Ensure logical order
- [ ] **Focus visible at all times** - Clear focus indicators
- [ ] **Activate buttons with Enter/Space** - All interactive elements work
- [ ] **Open/close modals with Esc** - Modals close properly
- [ ] **Navigate forms** - Tab through fields, submit with Enter
- [ ] **Focus trapped in modals** - Can't tab outside modal when open
- [ ] **Skip repetitive content** - Skip links work (if implemented)

### 4. Screen Reader Testing

#### Recommended Screen Readers

- **NVDA** (Windows) - Free, open-source
- **JAWS** (Windows) - Industry standard (paid)
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in

#### Testing Steps

1. **Enable screen reader**
2. **Navigate with keyboard** (Tab, Arrow keys)
3. **Listen to announcements** - Ensure meaningful content
4. **Test forms** - Field labels, error messages announced
5. **Test modals** - Proper announcements when opening/closing
6. **Test dynamic content** - Updates announced via `aria-live`

#### Key Questions

- Are all interactive elements announced?
- Are labels and instructions clear?
- Are error messages read aloud?
- Can you complete all tasks without seeing the screen?

### 5. Color Contrast Testing

#### Tools

- **Chrome DevTools** - Inspect element → Contrast ratio in color picker
- **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser** - Desktop app

#### Standards

- **Normal text (< 24px):** 4.5:1 minimum
- **Large text (≥ 24px or ≥ 18px bold):** 3:1 minimum
- **UI components & graphics:** 3:1 minimum

### 6. Zoom & Magnification Testing

1. Zoom to **200%** (`Ctrl +` / `Cmd +`)
2. Check for:
   - No horizontal scrolling
   - Text remains readable
   - Layouts don't break
   - All interactive elements accessible

### 7. Mobile Touch Testing

Test on actual devices (iPhone, Android):

- [ ] All buttons at least 44x44px
- [ ] Adequate spacing between touch targets
- [ ] No hover-only interactions (add touch alternatives)
- [ ] Forms easy to complete on mobile

---

## Accessibility Testing Workflow

### Before Every Release

1. **Run Lighthouse** on all major pages
   - LoginPage
   - FarmerRegistration
   - GovernmentDashboard
   - ConsumerVerification
   - SupplyChainUpdate

2. **Run axe DevTools** on all pages

3. **Manual keyboard test** critical user flows:
   - Login
   - Register
   - Add batch
   - View QR code
   - Submit form

4. **Screen reader spot check** key interactions

5. **Fix all Critical and Serious issues**

6. **Document remaining issues** (if any)

### Continuous Integration (CI)

Consider adding automated accessibility tests to CI pipeline:

```bash
npm install --save-dev @axe-core/cli
npx axe http://localhost:3000 --exit
```

---

## Common Accessibility Patterns

### Pattern: Modal Dialog

```tsx
const MyModal = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEscapeKey(() => setOpen(false), open);
  useFocusTrap(modalRef, open);
  useRestoreFocus(open);

  return (
    <div 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div ref={modalRef}>
        <h2 id="modal-title">Modal Title</h2>
        {/* Content */}
        <button onClick={() => setOpen(false)}>Close</button>
      </div>
    </div>
  );
};
```

### Pattern: Form with Validation

```tsx
<Label htmlFor="email">Email *</Label>
<Input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <div role="alert" id="email-error">
    {errors.email}
  </div>
)}
```

### Pattern: Icon Button

```tsx
<Button aria-label="Delete batch">
  <Trash className="w-5 h-5" aria-hidden="true" />
</Button>
```

### Pattern: Status Messages

```tsx
{/* Error */}
<div role="alert" aria-live="assertive">
  <AlertCircle aria-hidden="true" />
  <p>Failed to save batch</p>
</div>

{/* Success */}
<div role="status" aria-live="polite">
  <CheckCircle aria-hidden="true" />
  <p>Batch saved successfully</p>
</div>
```

---

## Accessibility Checklist (Per Page)

Use this checklist when auditing or creating new pages:

### Structure
- [ ] Semantic HTML (header, main, nav, section, footer)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Landmark regions labeled (`aria-label`)
- [ ] Skip links (optional, recommended)

### Forms
- [ ] All inputs have labels
- [ ] Required fields marked (`*` + `aria-required`)
- [ ] Error messages have `role="alert"`
- [ ] Errors linked via `aria-describedby`
- [ ] Autocomplete attributes used

### Interactive Elements
- [ ] All buttons/links have descriptive text or `aria-label`
- [ ] Decorative icons use `aria-hidden="true"`
- [ ] Touch targets ≥ 44x44px
- [ ] Focus indicators visible
- [ ] Tab order logical

### Modals/Dialogs
- [ ] `role="dialog"` and `aria-modal="true"`
- [ ] `aria-labelledby` points to title
- [ ] ESC key closes modal
- [ ] Focus trapped within modal
- [ ] Focus restored on close

### Images & Icons
- [ ] Images have descriptive `alt` text
- [ ] Decorative images have `alt=""`
- [ ] Icon buttons have `aria-label`
- [ ] SVG icons properly labeled

### Color & Contrast
- [ ] Text contrast ≥ 4.5:1
- [ ] UI components contrast ≥ 3:1
- [ ] Color not sole indicator

### Keyboard
- [ ] All functionality available via keyboard
- [ ] Logical tab order
- [ ] Focus trapped in modals
- [ ] ESC closes modals/dropdowns

### Dynamic Content
- [ ] `aria-live` for status messages
- [ ] `role="alert"` for errors
- [ ] `role="status"` for success messages

---

## Resources

### Official Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [W3C ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Testing Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Tool](https://wave.webaim.org/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### Screen Readers
- [NVDA (Windows)](https://www.nvaccess.org/)
- [JAWS (Windows)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (macOS/iOS)](https://www.apple.com/accessibility/voiceover/)
- [TalkBack (Android)](https://support.google.com/accessibility/android/answer/6283677)

### Learning
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Deque University](https://dequeuniversity.com/)

---

## Accessibility Team Contact

For accessibility questions or to report issues:

- **Email:** accessibility@krishiraksha.in
- **Slack:** #accessibility channel
- **GitHub Issues:** Tag with `a11y` label

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-02-01 | Initial accessibility implementation |

---

**Last Updated:** 2025-02-01  
**Maintained By:** Development Team
