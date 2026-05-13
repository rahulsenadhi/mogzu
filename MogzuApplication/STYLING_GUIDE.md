# Mogzu Platform - Styling Consistency Guide

## Overview
This guide documents the consistent styling system implemented across all post-signup pages to ensure uniform text sizing, spacing, alignment, and browser compatibility.

## CSS Architecture

### 1. Theme System (`/src/styles/theme.css`)
- **CSS Custom Properties**: All colors, spacing, and typography are defined as CSS variables
- **Browser Compatibility**: Comprehensive browser-specific fixes for Chrome, Safari, Firefox, Edge, and IE11
- **Responsive Design**: Mobile-first approach with proper breakpoints

### 2. Utility Classes (`/src/styles/utilities.css`)
Provides consistent utility classes for:
- Page containers and content wrappers
- Section spacing
- Card components
- Typography
- Grid layouts
- Buttons and inputs
- Filters and navigation

### 3. Layout Components (`/src/app/components/layouts/`)
Reusable React components that enforce consistency:
- **PageLayout**: Standard page wrapper with header
- **PageContent**: Content container with max-width
- **Section**: Consistent section spacing
- **Card**: Standardized card component
- **Grid**: Responsive grid layouts
- **SharedSidebar**: Unified sidebar navigation
- **SharedHeader**: Consistent top header

## Spacing Scale

All spacing follows a consistent scale defined in CSS variables:

```css
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
--spacing-2xl: 3rem;    /* 48px */
```

## Typography Scale

All text sizing uses these consistent values:

```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

## Grid System

Responsive grid layouts with consistent breakpoints:

- **Mobile (< 640px)**: 1 column
- **Tablet (640px - 1024px)**: 2 columns
- **Desktop (> 1024px)**: 3-4 columns

Usage:
```tsx
<Grid cols={4} gap="md">
  {items.map(item => <Card>...</Card>)}
</Grid>
```

## Browser Compatibility

### Chrome/Edge
- Autocomplete input styling normalized
- Scrollbar styling applied
- Tap highlight color removed

### Safari
- iOS zoom on input focus prevented
- Flex shrink issues fixed
- Touch callout handling
- Input appearance normalized

### Firefox
- Custom scrollbar styling
- Button padding normalized
- Background clip fixed

### IE11 (Limited Support)
- Grid fallback to -ms-grid
- Flexbox prefixes added

## Page Layout Structure

All pages should follow this structure:

```tsx
import { PageLayout, PageContent, Section, Grid, Card } from '@/app/components/layouts';

export default function YourPage() {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <SharedSidebar collapsed={collapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SharedHeader />
        
        <PageLayout 
          title="Page Title"
          subtitle="Page description"
        >
          <PageContent>
            <Section title="Section Title">
              <Grid cols={4} gap="md">
                {/* Content here */}
              </Grid>
            </Section>
          </PageContent>
        </PageLayout>
      </div>
    </div>
  );
}
```

## Common Patterns

### 1. Cards with Hover Effect
```tsx
<Card hover padding="md" className="cursor-pointer">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

### 2. Product/Service Cards
```tsx
<div className="product-card">
  <img src={image} className="product-card-image" />
  <div className="product-card-content">
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
</div>
```

### 3. Consistent Buttons
```tsx
<button className="btn-base btn-primary">
  Primary Action
</button>
```

### 4. Consistent Inputs
```tsx
<input 
  type="text" 
  className="input-base"
  placeholder="Enter text..."
/>
```

## Color Palette

### Primary Colors
- **Primary**: `#030213` (Dark blue-black)
- **Secondary**: `oklch(0.95 0.0058 264.53)` (Light blue-gray)
- **Accent**: `#e9ebef` (Light gray)

### UI Colors
- **Success**: `#4bd17c` (Green)
- **Warning**: `#fa8d40` (Orange)
- **Error**: `#d4183d` (Red)
- **Info**: `#34c5dc` (Cyan)

### Text Colors
- **Primary Text**: `#111827` (Gray-900)
- **Secondary Text**: `#6b7280` (Gray-500)
- **Muted Text**: `#9ca3af` (Gray-400)

## Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach
All styles start mobile and scale up:

```css
.element {
  /* Mobile styles */
  padding: 1rem;
}

@media (min-width: 768px) {
  .element {
    /* Tablet styles */
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .element {
    /* Desktop styles */
    padding: 2rem;
  }
}
```

## Best Practices

### 1. Always Use CSS Variables
```tsx
// ✅ Good
<div style={{ color: 'var(--foreground)' }}>

// ❌ Bad
<div style={{ color: '#111827' }}>
```

### 2. Use Layout Components
```tsx
// ✅ Good
<Section title="Products">
  <Grid cols={4}>...</Grid>
</Section>

// ❌ Bad
<div className="mb-8">
  <h2 className="text-lg font-semibold mb-4">Products</h2>
  <div className="grid grid-cols-4 gap-4">...</div>
</div>
```

### 3. Consistent Spacing
```tsx
// ✅ Good
<div className="mb-6">  // Uses spacing scale

// ❌ Bad
<div className="mb-7">  // Off the spacing scale
```

### 4. Avoid Inline Font Sizing
```tsx
// ✅ Good
<h2>Section Title</h2>  // Uses theme default

// ❌ Bad
<h2 className="text-xl">Section Title</h2>  // Override only when necessary
```

## Testing Checklist

When updating pages, verify:
- [ ] Consistent spacing between sections (1.5-2rem)
- [ ] Text sizes match the typography scale
- [ ] Cards have uniform padding (1.25-1.5rem)
- [ ] Grids are responsive (1 col → 2 col → 4 col)
- [ ] Headers are 4rem height
- [ ] Sidebar is 14rem width (collapsed: 4rem)
- [ ] All pages use max-width containers
- [ ] Browser compatibility (test in Chrome, Safari, Firefox, Edge)
- [ ] Mobile responsiveness (test at 375px, 768px, 1024px, 1440px)
- [ ] Focus states are visible and consistent

## Maintenance

### Adding New Pages
1. Import layout components from `@/app/components/layouts`
2. Use `PageLayout` for the main wrapper
3. Use `PageContent` for content area
4. Use `Section` for major sections
5. Use `Grid` and `Card` for content organization
6. Test on multiple browsers and screen sizes

### Updating Existing Pages
1. Replace custom layouts with layout components
2. Replace hard-coded spacing with utility classes
3. Ensure text uses theme typography
4. Test before and after for visual consistency

## Support

For questions or issues with the styling system:
1. Check this guide first
2. Review the theme.css and utilities.css files
3. Examine existing pages for examples
4. Test changes in multiple browsers

## Version History

- **v1.0.0** (2026-03-09): Initial styling system implementation
  - CSS variable system
  - Layout components
  - Browser compatibility fixes
  - Utility classes
  - Documentation
