# VidSync UI Style Guide

## Philosophy

Clean, minimal, premium. Think Cineby and Netflix, not a 2015 admin dashboard. When in doubt, remove visual noise rather than add it.

## Core Principles

- **No visible container borders.** Navbars, panels, and sections should float transparently over the background. Never box UI sections in bordered cards unless there is a strong functional reason (e.g., a modal).
- **No chunky input fields.** Search bars, text inputs, and form elements should use borderless or underline-only styling. Avoid background fills on inputs unless they are actively focused.
- **Sparse accent color.** The brand red (`#e50914`) appears ONLY on the logo icon and on focus/active states (e.g., input underlines). Never use it for large fills, backgrounds, or multiple simultaneous elements.
- **Transparent > opaque.** Prefer `background: transparent` with subtle hover transitions over solid background colors for buttons and interactive elements.
- **Whitespace is design.** Let elements breathe. Generous padding and spacing creates a premium feel; cramming elements together creates a tacky one.

## Color Palette

| Token | Hex | Usage |
| --- | --- | --- |
| Background | `#080808` | Page body |
| Text primary | `#ffffff` | Headings, active text |
| Text secondary | `#a0a0a0` | Inactive labels, room titles |
| Text muted | `#808080` | Icons, counters |
| Text dim | `#555` | Placeholders |
| Border subtle | `#333` | Separators, input underlines on hover |
| Accent | `#e50914` | Logo, focus underlines only |
| Hover fill | `rgba(255,255,255,0.08)` | Button hover backgrounds |

## Typography

- Font stack: `'Inter', 'Segoe UI', sans-serif`
- Brand name: 18px, weight 700, letter-spacing -0.3px
- Body/labels: 13-14px, weight 400-500
- Never use browser-default serif or monospace for UI elements

## What Makes It Tacky (avoid these)

- Bordered card containers wrapping navigation bars
- Bright colored button fills (orange, blue, green backgrounds)
- Multiple accent colors competing for attention
- Always-visible search bars with thick borders and separate search buttons
- Heavy drop shadows on flat UI elements
- Using `border: 1px solid` on everything

## Inspiration Reference

See `docs/inspiration/` for screenshots of Cineby and Netflix navbars that informed this style.
