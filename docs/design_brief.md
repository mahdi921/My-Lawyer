# Virtual Lawyer - UI/UX Design Brief

## Overview

Design guidelines for the Virtual Lawyer platform, adapted for Persian (Farsi) language with RTL layout.

---

## Typography

### Primary Font: **Vazirmatn**
```html
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

| Element | Size | Weight |
|---------|------|--------|
| H1 | 28-32px | 700 |
| H2 | 22-24px | 600 |
| Body | 14-16px | 400 |
| Small | 12px | 400 |

---

## Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Emerald | `#059669` |
| Primary Hover | Emerald Dark | `#047857` |
| Text | Slate 800 | `#1e293b` |
| Warning | Amber 500 | `#f59e0b` |
| Error | Red 500 | `#ef4444` |
| Background | Slate 50 | `#f8fafc` |

---

## RTL Layout

```css
html {
    direction: rtl;
    font-family: 'Vazirmatn', system-ui, sans-serif;
}
```

- Use `margin-inline-start` / `margin-inline-end`
- Use Tailwind's `ms-*` / `me-*` utilities
- Flip directional icons (arrows) horizontally

---

## Reference Websites

### Clean & Conversion-Focused
| Site | Key Feature |
|------|-------------|
| [Cook Group Legal](https://cookgrouplegal.com) | Sticky contact bar, chatbot widgets |
| [BK Immigration Law](https://bkimmigration.com) | Accessibility-first, high-contrast |

### Video & Human-First
| Site | Key Feature |
|------|-------------|
| [Vaught Law Firm](https://vaughtlawfirm.com) | Video hero, clear CTA |
| [Cooley Law Firm](https://cooley.com) | Big hero imagery, elegant nav |

### Navigation-First
| Site | Key Feature |
|------|-------------|
| [LewisRice](https://lewisrice.com) | Advanced filter/search |
| [DLA Piper](https://dlapiper.com) | Enterprise nav, global search |

### Bold Branded
| Site | Key Feature |
|------|-------------|
| [Hogan Lovells](https://hoganlovells.com) | Bold colors, dynamic layout |
| [Akin Gump](https://akingump.com) | Modern branded layout |

---

## UI Priorities

1. **Hero Section** - Contact form/chat above fold, optional video
2. **Trust Elements** - Testimonials, success metrics, case highlights
3. **Service Directory** - Cards with icons by legal area
4. **Search & Filter** - Attorney/practice search for complex sites
5. **Mobile-First** - Simplified menus, touch-friendly (44x44px targets)
6. **Accessibility** - Font adjuster, high-contrast mode

---

## Aesthetic Directions

Choose one for implementation:

| Style | Description | Reference |
|-------|-------------|-----------|
| **Modern Minimalist** | Clean whitespace, subtle animations | HagEstad Law |
| **Professional Corporate** | Grid layouts, structured info | DLA Piper |
| **Human-Centric** | Hero video, soft accents | Vaught Law |
| **Bold Branded** | Distinct palette, scroll transitions | Hogan Lovells |

---

## Accessibility (a11y)

- All elements: `aria-label` in Persian
- Progress bars: `role="progressbar"` + `aria-valuenow`
- Text contrast: minimum 4.5:1
- Focus indicators visible
- Logical tab order (RTL-aware)
