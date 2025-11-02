# Responsive Design System Guide

## Overview

This project implements a **mobile-first responsive design system** using CSS Grid, Flexbox, and modern CSS custom properties. All layouts automatically adapt to different screen sizes.

## Breakpoints

```css
Mobile:   320px - 767px   (default, mobile-first)
Tablet:   768px - 1023px  (medium screens)
Desktop:  1024px - 1279px (large screens)
XL:       1280px+         (extra large screens)
```

## Quick Start

### 1. Import Responsive CSS

Already imported in `main.tsx`:
```typescript
import './styles/responsive.css';
```

### 2. Use Responsive Components

```typescript
import { 
  ResponsiveLayout,
  PageHeader,
  PageContainer,
  ResponsiveGrid,
  Card,
  Flex,
  Section 
} from './components/ResponsiveLayout';

function MyPage() {
  return (
    <ResponsiveLayout>
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome back"
        actions={<button>Action</button>}
      />
      <PageContainer>
        <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
          <Card>Content 1</Card>
          <Card>Content 2</Card>
          <Card>Content 3</Card>
        </ResponsiveGrid>
      </PageContainer>
    </ResponsiveLayout>
  );
}
```

## Components

### ResponsiveLayout

Main app wrapper with flexbox column layout.

```typescript
<ResponsiveLayout>
  {children}
</ResponsiveLayout>
```

### PageHeader

Responsive header with title, subtitle, and actions.

**Mobile:** Stacks vertically  
**Desktop:** Side-by-side layout

```typescript
<PageHeader 
  title="Page Title"
  subtitle="Optional subtitle"
  actions={
    <button>Action Button</button>
  }
/>
```

### PageContainer

Main content area with responsive padding.

**Mobile:** 16px padding  
**Tablet:** 32px padding  
**Desktop:** 48-64px padding

```typescript
<PageContainer maxWidth="xl">
  {children}
</PageContainer>
```

Options: `maxWidth`: `'sm' | 'md' | 'lg' | 'xl' | 'full'`

### ResponsiveGrid

CSS Grid with responsive columns.

```typescript
<ResponsiveGrid 
  cols={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="lg"
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</ResponsiveGrid>
```

**Responsive behavior:**
- Mobile: 1 column (stacked)
- Tablet: 2 columns
- Desktop: 3 columns

### Card

Responsive card with auto-adjusting padding.

```typescript
<Card padding="lg" hover={true}>
  Content here
</Card>
```

**Padding scales:**
- Mobile: 16px
- Tablet: 24px
- Desktop: 32px

### Flex

Flexible container with responsive stacking.

```typescript
<Flex 
  direction="row"
  align="center"
  justify="between"
  gap="md"
  responsive={true}  // Stacks on mobile
>
  <div>Item 1</div>
  <div>Item 2</div>
</Flex>
```

### Section

Content section with title.

```typescript
<Section 
  title="Section Title"
  subtitle="Optional description"
  spacing="xl"
>
  {children}
</Section>
```

## CSS Utility Classes

### Container

Responsive container with max-width:

```html
<div class="container">
  Content with responsive width and padding
</div>
```

### Grid System

```html
<!-- Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols -->
<div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Flexbox Utilities

```html
<div class="flex items-center justify-between gap-md">
  <div>Left</div>
  <div>Right</div>
</div>
```

**Classes:**
- `flex`, `flex-col`, `flex-row`, `flex-wrap`
- `items-center`, `items-start`, `items-end`
- `justify-center`, `justify-between`, `justify-start`, `justify-end`
- `gap-xs`, `gap-sm`, `gap-md`, `gap-lg`, `gap-xl`, `gap-2xl`

### Spacing

```html
<div class="p-lg">Padding large</div>
<div class="m-xl">Margin extra-large</div>
<div class="mt-2xl">Margin-top 2xl</div>
<div class="mb-lg">Margin-bottom large</div>
```

**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`

### Visibility

```html
<div class="hidden-mobile">Hidden on mobile</div>
<div class="hidden-desktop">Hidden on desktop</div>
<div class="mobile-only">Mobile only</div>
<div class="tablet-up">Tablet and up</div>
```

## CSS Variables

### Spacing

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px
--spacing-3xl: 48px
--spacing-4xl: 64px
```

### Typography

```css
/* Font Sizes (Mobile-first) */
--font-size-xs: 12px
--font-size-sm: 14px
--font-size-base: 16px
--font-size-lg: 18px
--font-size-xl: 20px
--font-size-2xl: 24px  (h1 mobile)
--font-size-3xl: 30px  (h1 tablet)
--font-size-4xl: 36px  (h1 desktop)
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1)
```

### Border Radius

```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
```

## Responsive Typography

### Headings

Automatically scale based on screen size:

```html
<h1>Main Title</h1>     <!-- 24px → 30px → 36px -->
<h2>Section Title</h2>  <!-- 20px → 24px → 30px -->
<h3>Subsection</h3>     <!-- 18px → 20px → 24px -->
```

### Line Heights

```css
--line-height-tight: 1.25    (headings)
--line-height-normal: 1.5    (body text)
--line-height-relaxed: 1.75  (paragraphs)
```

## Examples

### Example 1: Responsive Dashboard

```typescript
function Dashboard() {
  return (
    <ResponsiveLayout>
      <PageHeader 
        title="Dashboard" 
        subtitle="Overview of your data"
        actions={
          <button className="btn">New Item</button>
        }
      />
      
      <PageContainer>
        {/* Stats Cards */}
        <Section title="Statistics">
          <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }}>
            <Card>
              <h3>Total Users</h3>
              <p className="text-4xl">1,234</p>
            </Card>
            <Card>
              <h3>Revenue</h3>
              <p className="text-4xl">$56K</p>
            </Card>
            <Card>
              <h3>Orders</h3>
              <p className="text-4xl">890</p>
            </Card>
            <Card>
              <h3>Growth</h3>
              <p className="text-4xl">+23%</p>
            </Card>
          </ResponsiveGrid>
        </Section>

        {/* Content Grid */}
        <Section title="Recent Activity">
          <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
            <Card>Activity 1</Card>
            <Card>Activity 2</Card>
            <Card>Activity 3</Card>
          </ResponsiveGrid>
        </Section>
      </PageContainer>
    </ResponsiveLayout>
  );
}
```

### Example 2: Form Layout

```typescript
function FormPage() {
  return (
    <PageContainer maxWidth="md">
      <Card padding="xl">
        <h2>Registration Form</h2>
        
        {/* Mobile: Stack, Desktop: Side-by-side */}
        <Flex responsive gap="md">
          <div style={{ flex: 1 }}>
            <label>First Name</label>
            <input type="text" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Last Name</label>
            <input type="text" />
          </div>
        </Flex>

        <div className="mt-lg">
          <label>Email</label>
          <input type="email" />
        </div>

        <Flex gap="md" justify="end" className="mt-xl">
          <button className="btn">Cancel</button>
          <button className="btn">Submit</button>
        </Flex>
      </Card>
    </PageContainer>
  );
}
```

### Example 3: List with Actions

```typescript
function ListPage() {
  return (
    <PageContainer>
      <div className="card">
        {/* Mobile: Stack, Desktop: Side-by-side */}
        <Flex responsive align="center" justify="between" className="mb-lg">
          <h2>Items</h2>
          <button>Add New</button>
        </Flex>

        {/* Responsive grid of items */}
        <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
          {items.map(item => (
            <Card key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Card>
          ))}
        </ResponsiveGrid>
      </div>
    </PageContainer>
  );
}
```

## Testing Responsive Design

### Browser DevTools

1. Open Chrome/Firefox DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Test these devices:
   - iPhone SE (375px)
   - iPhone 12/13 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1280px+)

### Breakpoint Testing

Test at these specific widths:
- 320px (minimum mobile)
- 375px (iPhone)
- 768px (tablet breakpoint)
- 1024px (desktop breakpoint)
- 1440px (large desktop)

### Test Checklist

- [ ] Text is readable at all sizes
- [ ] Touch targets are 44x44px minimum on mobile
- [ ] No horizontal scrolling
- [ ] Cards/grids reflow properly
- [ ] Forms are easy to fill on mobile
- [ ] Buttons are appropriately sized
- [ ] Images scale without distortion
- [ ] Navigation is accessible
- [ ] Padding feels balanced
- [ ] Typography scales appropriately

## Best Practices

### ✅ DO

1. **Start with mobile design first**
   ```css
   /* Mobile (default) */
   .element { font-size: 14px; }
   
   /* Tablet and up */
   @media (min-width: 768px) {
     .element { font-size: 16px; }
   }
   ```

2. **Use responsive components**
   ```typescript
   <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
   ```

3. **Test on real devices**
   - iPhone
   - Android
   - iPad
   - Desktop browsers

4. **Use CSS variables**
   ```css
   padding: var(--spacing-lg);
   ```

5. **Touch-friendly targets**
   ```html
   <button class="touch-target">Tap Me</button>
   ```

### ❌ DON'T

1. **Don't use fixed pixel widths**
   ```css
   ❌ width: 300px;
   ✅ width: 100%; max-width: 300px;
   ```

2. **Don't assume desktop**
   - Design for mobile first
   - Enhance for larger screens

3. **Don't use tiny touch targets**
   - Minimum 44x44px for buttons/links

4. **Don't rely on hover**
   - Mobile has no hover state
   - Use click/tap interactions

5. **Don't forget viewport meta tag**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```

## Performance

### CSS Loading

Responsive CSS is loaded once and cached:
```typescript
import './styles/responsive.css';  // ~15KB gzipped
```

### No JavaScript Required

Layout is pure CSS - no JS overhead for responsiveness.

### GPU Acceleration

Transitions use CSS transforms for smooth animations:
```css
transition: transform 0.3s ease;
```

## Accessibility

### Touch Targets

Minimum 44x44px for interactive elements:
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### Focus States

All interactive elements have visible focus:
```css
button:focus {
  outline: 2px solid blue;
  outline-offset: 2px;
}
```

### Screen Readers

Semantic HTML with proper headings:
```html
<header>, <main>, <section>, <nav>
<h1>, <h2>, <h3> (hierarchical)
```

## Migration Guide

### Converting Existing Components

**Before:**
```typescript
<div style={{ padding: '20px', display: 'flex' }}>
  <div style={{ width: '33%' }}>Item 1</div>
  <div style={{ width: '33%' }}>Item 2</div>
  <div style={{ width: '33%' }}>Item 3</div>
</div>
```

**After:**
```typescript
<ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</ResponsiveGrid>
```

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile Safari (iOS 14+)
- Chrome Mobile

CSS Grid and Flexbox are fully supported.

---

**Ready to use!** All components are mobile-first and fully responsive. 🎉
