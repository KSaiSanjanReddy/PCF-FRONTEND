# EnviGuide Design System & Style Guide

This style guide documents the visual identity, structural patterns, and animation principles of the **EnviGuide** web project. Use this document as a master reference to implement consistent styles, components, and interactions across different projects and contents.

---

## 📂 Table of Contents
1. [Visual Identity & Tone](#1-visual-identity--tone)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Grid & Structural Layouts](#4-grid--structural-layouts)
5. [Core Components](#5-core-components)
6. [Interactive Systems & Animations](#6-interactive-systems--animations)
7. [Implementation Boilerplate](#7-implementation-boilerplate)

---

## 1. Visual Identity & Tone
EnviGuide merges **technical rigidity** with **premium editorial aesthetics**. The design communicates transparency, precision, and modern environmental standards.
*   **Theming Strategy:** A clean dual-theme interface. Sections toggle between high-contrast dark values (`on-dark`) and soft light-grey surfaces (`on-light`) to structure content and control pacing.
*   **Visual Motifs:** Hairlines (`1px`), blurred backdrop surfaces, smooth cubic-bezier transitions, and dynamic SVG drawing effects.

---

## 2. Color Palette

The colors are mapped to CSS custom properties. They are divided into dark-mode background values, light-mode background values, and semantic highlights.

### The CSS Variables
```css
:root {
  /* On-Dark Theme Backgrounds & Borders */
  --ink: #0A1410;          /* Deepest Pine-Black (Global background) */
  --pine: #11201A;         /* Dark Surface (Cards, standard containers) */
  --pine-2: #16291F;       /* Dark Surface Raised (Elevated elements) */
  --line-d: #23382C;       /* Dark Hairline (Subtle borders) */
  --txt-l: #EDF3EE;        /* Light Primary Text */
  --txt-l-soft: #9AB0A3;   /* Light Muted Text */

  /* On-Light Theme Backgrounds & Borders */
  --porcelain: #F6F8F6;    /* Light Background (Global container) */
  --mist: #E8EFE9;         /* Light Surface (Cards, vignettes) */
  --line-l: #D8E2DA;       /* Light Hairline (Subtle borders) */
  --txt-d: #0E1A14;        /* Dark Primary Text */
  --txt-d-soft: #51635A;   /* Dark Muted Text */
  --paperwhite: #FFFFFF;   /* Elevated Light Surface (Card base) */

  /* Semantic Accents & Highlights */
  --emerald: #2FB573;      /* Primary Brand Green (Highlights, indicators) */
  --emerald-deep: #1C8A55; /* Contrast Brand Green (Text on light backgrounds) */
  --amber: #E89B3C;        /* Alert/Attention Orange */
  --amber-deep: #C97E1F;   /* Contrast Attention Orange (Text on light backgrounds) */
  --graphite: #8E9994;     /* Neutral Muted Gray */
}
```

### Color Mapping & Usage Guidelines
| Token Name | Hex Code | Semantic Role | Target Environments / Usages |
| :--- | :--- | :--- | :--- |
| `--ink` | `#0A1410` | Base Dark BG | Body background on dark sections; dark text selection highlights. |
| `--pine` | `#11201A` | Secondary Dark | Main card containers, floating widgets, scrolled navigation header background. |
| `--line-d` | `#23382C` | Hairline Dark | 1px borders, card wrappers, and division rules in dark sections. |
| `--porcelain` | `#F6F8F6` | Base Light BG | Global background for light sections. |
| `--mist` | `#E8EFE9` | Secondary Light | Container background for interactive vignettes, badges, and card assets. |
| `--line-l` | `#D8E2DA` | Hairline Light | 1px borders, cards, progress track boundaries in light sections. |
| `--emerald` | `#2FB573` | Brand Highlight | Primary buttons, success indicators, scroll path fills, and text emphasis on dark BGs. |
| `--emerald-deep` | `#1C8A55` | Brand Highlight | Text elements, checkboxes, and badge headers on light BGs (contrast compliance). |
| `--amber` | `#E89B3C` | Notice / Alert | Warning tags, hotspots, highlight alerts, indicator ticks on dark BGs. |
| `--amber-deep` | `#C97E1F` | Notice / Alert | Highlight text and badge highlights on light BGs. |

---

## 3. Typography

The system utilizes three Google Fonts to create a technical but editorial layout.

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Font Configurations
1.  **Editorial Serif:** `"Instrument Serif", Georgia, "Times New Roman", serif;`
    *   *Usage:* Display headers (`.h1`, `h2.display`), large numbers, and italicized accents (`em`).
    *   *Characteristics:* High vertical contrast, sharp serifs, zero horizontal padding.
2.  **Modern Sans:** `"Instrument Sans", "Helvetica Neue", Arial, sans-serif;`
    *   *Usage:* Body copies (`p`, `.sub`), button text, structural labels, lists.
    *   *Characteristics:* Clean geometric letterforms, open apertures for screen legibility.
3.  **Technical Mono:** `"IBM Plex Mono", ui-monospace, "SF Mono", monospace;`
    *   *Usage:* Pre-headers (`.kicker`), code tags, values, numerical results, copyright lines.
    *   *Characteristics:* Uniform width, developer-centric layout, uppercase letter-spacing.

### Typographic Hierarchy & Scale
*   **Hero H1 Header (`.h1`):**
    *   *Size:* `clamp(2.9rem, 6.4vw, 5.4rem)` *(Fluid text)*
    *   *Weight:* 400 (Regular)
    *   *Line-Height:* `1.0` (Tightly stacked lines)
    *   *Letter-Spacing:* `-0.02em`
*   **Section Display Heading (`h2.display`):**
    *   *Size:* `clamp(2.4rem, 5vw, 3.9rem)` *(Fluid text)*
    *   *Weight:* 400 (Regular)
    *   *Line-Height:* `1.02`
    *   *Letter-Spacing:* `-0.015em`
*   **Body Copy Subtitle (`.sub`):**
    *   *Size:* `clamp(1.02rem, 1.6vw, 1.18rem)`
    *   *Weight:* 400 (Regular)
    *   *Line-Height:* `1.65` (High readability spacing)
    *   *Constraints:* `max-width: 58ch` (Prevent horizontal line strain)
*   **Pre-Header Labels (`.kicker`):**
    *   *Size:* `0.72rem` (fixed)
    *   *Weight:* 500 (Medium)
    *   *Letter-Spacing:* `0.22em` (Uppercase spaced)

---

## 4. Grid & Structural Layouts

### 1. Global Centered Wrapper (`.wrap`)
Maintains vertical grid alignments across all widths.
```css
.wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 28px;
}
@media(max-width: 640px) {
  .wrap {
    padding: 0 20px;
  }
}
```

### 2. Double-Theme Section Alternation
To create sections that alternate between dark and light themes:
```html
<!-- Dark Section -->
<section class="on-dark" style="background: var(--ink); color: var(--txt-l);">
  <div class="wrap"> ... </div>
</section>

<!-- Light Section -->
<section class="on-light" style="background: var(--porcelain); color: var(--txt-d);">
  <div class="wrap"> ... </div>
</section>
```

### 3. Hairline Segment Divider (`.rule`)
Renders a structural centered text line with 1px border wings on each side:
```html
<div class="rule">EnviGuide · The method</div>
```
```css
.rule {
  display: flex;
  align-items: center;
  gap: 18px;
  font-family: var(--mono);
  font-size: .68rem;
  letter-spacing: .24em;
  text-transform: uppercase;
}
.rule::before, .rule::after {
  content: "";
  height: 1px;
  flex: 1;
}
.on-dark .rule { color: #5E7468; }
.on-dark .rule::before, .on-dark .rule::after { background: var(--line-d); }
.on-light .rule { color: #94A69B; }
.on-light .rule::before, .on-light .rule::after { background: var(--line-l); }
```

---

## 5. Core Components

### 1. Pre-Header Label Component (`.kicker`)
Includes a tiny square tick indicator.
```html
<span class="kicker"><span class="tick"></span>Category Name</span>
```
```css
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--mono);
  font-size: .72rem;
  font-weight: 500;
  letter-spacing: .22em;
  text-transform: uppercase;
}
.kicker .tick {
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background: var(--emerald);
  flex: none;
}
.on-dark .kicker { color: var(--txt-l-soft); }
.on-light .kicker { color: var(--txt-d-soft); }
```

### 2. Pill Button System (`.btn`)
Premium hover transitions featuring custom easing curves.
```html
<a class="btn btn-solid" href="#">Action button <span class="arr">→</span></a>
```
```css
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: .95rem;
  letter-spacing: .01em;
  padding: 15px 28px;
  border-radius: 999px;
  text-decoration: none;
  transition: transform .25s var(--ease), box-shadow .25s var(--ease), background .25s;
  overflow: hidden;
}
.btn .arr {
  transition: transform .25s var(--ease);
}
.btn:hover .arr {
  transform: translateX(4px);
}
.btn:hover {
  transform: translateY(-2px);
}

/* Button Variants */
.btn-solid {
  background: var(--emerald);
  color: var(--ink);
}
.btn-solid:hover {
  background: #3DCB86;
  box-shadow: 0 12px 28px -10px rgba(47, 181, 115, 0.55);
}
.btn-line-d {
  border: 1px solid var(--line-d);
  color: var(--txt-l);
}
.btn-line-d:hover {
  border-color: var(--emerald);
}
.btn-line-l {
  border: 1px solid var(--line-l);
  color: var(--txt-d);
  background: var(--paperwhite);
}
.btn-line-l:hover {
  border-color: var(--emerald-deep);
}
```

### 3. Glassmorphic Navigation Header
Toggles to a blurred, scrolled state after leaving the top of the viewport.
```html
<header id="hdr">
  <div class="wrap nav">
    <a class="brand" href="#top">BrandLogo</a>
    <ul class="nav-links">
      <li><a href="#about">About</a></li>
      <li><a class="btn btn-solid" href="#contact">Contact</a></li>
    </ul>
  </div>
</header>
```
```css
header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 90;
  transition: background .4s, border-color .4s, backdrop-filter .4s;
  border-bottom: 1px solid transparent;
}
header.scrolled {
  background: rgba(10, 20, 16, 0.78);
  backdrop-filter: blur(14px);
  border-color: var(--line-d);
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}
```

---

## 6. Interactive Systems & Animations

### 1. Viewport Reveal System (`.rv`)
Fades elements in and translates them upward when they cross `15%` of the viewport height.

#### CSS Transition Structure
```css
.rv {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity .8s var(--ease), transform .8s var(--ease);
}
.rv.in {
  opacity: 1;
  transform: none;
}

/* Delay modifiers */
.rv-d1 { transition-delay: .08s; }
.rv-d2 { transition-delay: .16s; }
.rv-d3 { transition-delay: .24s; }
.rv-d4 { transition-delay: .32s; }
```

#### JavaScript trigger
```js
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target); // Trigger once
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.rv').forEach(element => revealObserver.observe(element));
```

### 2. Title Split-Line Mask Reveal
Prevents layout shifts while loading headers, slide-revealing headings line-by-line.
```html
<h1 class="h1">
  <span class="ln"><span>First line</span></span>
  <span class="ln"><span>Italicized <em>Second</em> line</span></span>
</h1>
```
```css
.h1 .ln {
  display: block;
  overflow: hidden; /* Clips children outside bounds */
}
.h1 .ln span {
  display: inline-block;
  transform: translateY(110%);
  transition: transform 1s var(--ease);
}
.h1 .ln:nth-child(2) span { transition-delay: .12s; }

/* Triggers after window loads */
body.loaded .h1 .ln span {
  transform: none;
}
```

### 3. Mouse Parallax Stack (3D Cards)
Floating components translate dynamically to mock physical depth based on desktop cursor positions.
```html
<div class="stack" id="stack">
  <div class="card" data-depth="10">Main Layer</div>
  <div class="card card-float" data-depth="26">Floating widget</div>
</div>
```
```js
const stack = document.getElementById('stack');
const cards = stack.querySelectorAll('.card');
let frameId = null;

stack.addEventListener('mousemove', (e) => {
  const rect = stack.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) / rect.width - 0.5; // [-0.5, 0.5]
  const mouseY = (e.clientY - rect.top) / rect.height - 0.5; // [-0.5, 0.5]

  if (frameId) return;
  frameId = requestAnimationFrame(() => {
    cards.forEach(card => {
      const depth = +card.dataset.depth || 12;
      card.style.transform = `translate(${(-mouseX * depth).toFixed(1)}px, ${(-mouseY * depth).toFixed(1)}px)`;
    });
    frameId = null;
  });
});

stack.addEventListener('mouseleave', () => {
  cards.forEach(card => card.style.transform = '');
});
```

---

## 7. Implementation Boilerplate

For a complete interactive template with the exact CSS, HTML layout structure, and Javascript animations, copy [landing_template.html](file:///C:/Users/ASUS/.gemini/antigravity-ide/brain/0228d64c-1095-4821-a905-e002bb39f0e2/landing_template.html).
You can copy this file, change variables in `:root`, and easily swap out structural parts for other projects.
