# Accessibility Testing - Quick Start Guide

## 🎯 Goal: Accessibility Score Above 90%

This is a quick reference guide for testing accessibility in the Krishiraksha application.

---

## ⚡ Quick Testing Steps

### 1. Lighthouse Test (5 minutes)

**Chrome DevTools:**
1. Press `F12` or `Ctrl+Shift+I`
2. Go to **Lighthouse** tab
3. Select **Accessibility** + **Performance** + **Best Practices**
4. Choose **Mobile** device
5. Click **Analyze page load**
6. **Target: Accessibility ≥ 90%**

**Test These Pages:**
- [ ] LoginPage: `http://localhost:3000`
- [ ] FarmerRegistration (after login as farmer)
- [ ] GovernmentDashboard (login as gov user)
- [ ] ConsumerVerification (login as consumer)

---

### 2. Keyboard Navigation Test (3 minutes)

**Disconnect your mouse and test:**

- [ ] Press `Tab` - Can you reach all buttons, links, inputs?
- [ ] Press `Shift+Tab` - Navigate backwards
- [ ] Open a modal - Can you see focus outline?
- [ ] Press `Esc` - Does modal close?
- [ ] Fill a form - Tab between fields, submit with `Enter`
- [ ] Focus stuck in modal? (Good! That's focus trap)

**Pages to Test:**
- Login form
- Add batch modal (Farmer page)
- QR code modal

---

### 3. axe DevTools Test (2 minutes)

**Install Extension:**
- Chrome: [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)

**Run Test:**
1. Open DevTools → **axe DevTools** tab
2. Click **Scan ALL of my page**
3. Review results by severity
4. **Fix all Critical & Serious issues**

---

### 4. Manual Checks (5 minutes)

#### Forms
- [ ] All inputs have visible labels
- [ ] Error messages appear below fields
- [ ] Required fields marked with `*`
- [ ] Can submit form with keyboard

#### Buttons & Links
- [ ] Icon-only buttons have tooltips or labels
- [ ] Button text describes action (not "Click here")
- [ ] All clickable items work with keyboard

#### Images & Icons
- [ ] Decorative icons ignored by screen reader
- [ ] Important icons have descriptions
- [ ] Images have alt text (if any)

#### Contrast
- [ ] Text readable on backgrounds
- [ ] Buttons have enough contrast
- [ ] Use [Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🐛 Common Issues & Quick Fixes

### Issue: Low Lighthouse Score

**Check:**
- Missing `aria-label` on icon buttons
- Missing `alt` text on images
- Form inputs without labels
- Low color contrast
- Missing ARIA attributes on modals

**Fix:**
```tsx
// Before
<button onClick={handleClick}>
  <Plus />
</button>

// After
<button onClick={handleClick} aria-label="Add new batch">
  <Plus aria-hidden="true" />
</button>
```

---

### Issue: Modal Doesn't Close with Esc

**Fix:** Use `useEscapeKey` hook:

```tsx
import { useEscapeKey, useFocusTrap } from '../hooks/useKeyboardNavigation';

const MyModal = () => {
  const modalRef = useRef(null);
  useEscapeKey(() => setOpen(false), open);
  useFocusTrap(modalRef, open);

  return (
    <div role="dialog" aria-modal="true">
      <div ref={modalRef}>
        {/* Content */}
      </div>
    </div>
  );
};
```

---

### Issue: Focus Not Visible

**Fix:** Ensure focus styles exist:

```css
/* In your CSS or Tailwind config */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid #2E7D32;
  outline-offset: 2px;
}
```

---

### Issue: Screen Reader Announces Wrong Info

**Fix:** Add proper ARIA labels:

```tsx
// Form field
<Label htmlFor="email">Email</Label>
<Input
  id="email"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <div role="alert" id="email-error">{error}</div>}

// Icon button
<Button aria-label="Delete batch">
  <Trash aria-hidden="true" />
</Button>

// Status message
<div role="status" aria-live="polite">
  Saved successfully!
</div>
```

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Lighthouse accessibility score ≥ 90% on all major pages
- [ ] No Critical or Serious axe issues
- [ ] All forms keyboard accessible
- [ ] All modals closable with Esc
- [ ] All icon buttons have labels
- [ ] Error messages use `role="alert"`
- [ ] Touch targets ≥ 44x44px (mobile)

---

## 🔗 Quick Links

- **Full Documentation:** [ACCESSIBILITY.md](./ACCESSIBILITY.md)
- **Lighthouse:** Chrome DevTools → Lighthouse
- **axe Extension:** [Chrome Web Store](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

## 💡 Pro Tips

1. **Test in Development:** Run Lighthouse on every new feature
2. **Keyboard First:** Build with keyboard in mind from the start
3. **Use Semantic HTML:** `<button>` not `<div onClick>`
4. **ARIA is Last Resort:** Prefer semantic HTML over ARIA
5. **Test with Real Users:** If possible, get feedback from users with disabilities

---

## 🚨 Red Flags

Stop and fix immediately if you see:

- ❌ Lighthouse accessibility < 80%
- ❌ Critical axe issues
- ❌ Can't reach element with keyboard
- ❌ Modal doesn't close with Esc
- ❌ Error messages not announced by screen reader
- ❌ Form submission fails with keyboard only

---

## 📞 Need Help?

- **Full Guide:** See [ACCESSIBILITY.md](./ACCESSIBILITY.md)
- **Code Examples:** Check `src/hooks/useKeyboardNavigation.ts`
- **Patterns:** See Common Accessibility Patterns in ACCESSIBILITY.md

---

**Last Updated:** 2025-02-01  
**Quick Start Version:** 1.0
