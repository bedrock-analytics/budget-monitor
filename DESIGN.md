---
version: alpha
name: Bedrock
description: >-
  Design system for Bedrock, a Thai HealthTech and analytics platform. Clean,
  professional, and calm — deep-teal accents on generous white space, with
  Noto Sans Thai as the primary typeface for first-class Thai-script support.
colors:
  # Brand primary scale (Primary Green)
  primary: "#015850"
  primary-hover: "#02A998"
  primary-pressed: "#01534C"
  primary-50: "#CAFEF8"
  primary-100: "#A1FEF3"
  primary-200: "#51FDEA"
  primary-300: "#03F9DF"
  primary-400: "#02A998"
  primary-500: "#015850"
  primary-600: "#01534C"
  primary-700: "#014E48"
  primary-800: "#014944"
  primary-900: "#01443F"
  # Semantic / functional
  confirm: "#00AA86"
  danger: "#CC0004"
  submit: "#016987"
  warning: "#FF8900"
  info: "#008BFF"
  # Status (Ant Design library)
  success: "#52C41A"
  success-bg: "#F6FFED"
  info-strong: "#1677FF"
  info-bg: "#E6F4FF"
  warning-strong: "#FAAD14"
  warning-bg: "#FFFBE6"
  error: "#FF4D4F"
  error-bg: "#FFF1F0"
  # Neutral / text / surface
  text: "#35373C"
  text-strong: "#171923"
  text-secondary: "#2D3748"
  text-muted: "#718096"
  text-disabled: "#A6A6B0"
  on-primary: "#FFFFFF"
  surface: "#FFFFFF"
  surface-muted: "#F1F2F4"
  border: "#E2E8F0"
  border-strong: "#4A5568"
  divider: "#D7DAE0"
typography:
  h1:
    fontFamily: Noto Sans Thai
    fontSize: 64px
    fontWeight: 700
    lineHeight: 72px
    letterSpacing: 0.16px
  h2:
    fontFamily: Noto Sans Thai
    fontSize: 48px
    fontWeight: 700
    lineHeight: 56px
    letterSpacing: 0.12px
  h3:
    fontFamily: Noto Sans Thai
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: 0.09px
  subtitle-1:
    fontFamily: Noto Sans Thai
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0.06px
  subtitle-2:
    fontFamily: Noto Sans Thai
    fontSize: 22px
    fontWeight: 600
    lineHeight: 30px
    letterSpacing: 0.055px
  subtitle-3:
    fontFamily: Noto Sans Thai
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0.05px
  body-1:
    fontFamily: Noto Sans Thai
    fontSize: 24px
    fontWeight: 400
    lineHeight: 32px
    letterSpacing: 0.06px
  body-2:
    fontFamily: Noto Sans Thai
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0.04px
  body-3:
    fontFamily: Noto Sans Thai
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0.035px
  button-1:
    fontFamily: Noto Sans Thai
    fontSize: 24px
    fontWeight: 500
    lineHeight: 36px
    letterSpacing: 0.06px
  button-2:
    fontFamily: Noto Sans Thai
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0.04px
  button-3:
    fontFamily: Noto Sans Thai
    fontSize: 14px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: 0.035px
  caption:
    fontFamily: Noto Sans Thai
    fontSize: 12px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0.03px
rounded:
  none: 0px
  sm: 2px
  base: 4px
  md: 6px
  lg: 8px
  xl: 12px
  2xl: 16px
  3xl: 24px
  full: 9999px
spacing:
  0: 0px
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  14: 56px
  16: 64px
  20: 80px
  24: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-2}"
    rounded: "{rounded.lg}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
  button-confirm:
    backgroundColor: "{colors.confirm}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
  button-submit:
    backgroundColor: "{colors.submit}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
  button-disabled:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-disabled}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: 24px
  modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 24px
  modal-title:
    textColor: "{colors.text-strong}"
    typography: "{typography.body-2}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-2}"
    rounded: "{rounded.base}"
    padding: 12px
  input-label:
    textColor: "{colors.text}"
    typography: "{typography.body-3}"
  tag:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 4px
  tab-active:
    textColor: "{colors.primary}"
    typography: "{typography.body-2}"
  tab-inactive:
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-2}"
  tooltip:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text}"
    typography: "{typography.body-3}"
    rounded: "{rounded.base}"
    padding: 8px
  alert-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
  alert-info:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
  alert-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
  alert-error:
    backgroundColor: "{colors.error-bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
  avatar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.full}"
  progress-track:
    backgroundColor: "{colors.border}"
    rounded: "{rounded.full}"
  progress-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
---

## Overview

Bedrock is a Thai HealthTech and analytics platform. Its visual language is built
to feel **clean, professional, trustworthy, and calm** — the qualities people
expect of software that touches their health and their data.

Three principles govern every decision:

- **Restraint over expression.** White backgrounds, generous whitespace, and
  precise grid alignment do the heavy lifting. There are no loud decorations,
  gradients, or competing accents. When in doubt, add more white space.
- **A single, confident accent.** The deep teal Primary Green (`#015850`) is the
  one color that signals "this is Bedrock." It carries brand identity, primary
  actions, and active states — and nothing dilutes it.
- **Thai-first.** Noto Sans Thai is the primary typeface for all UI text. It
  renders Thai script with excellent readability while remaining clean in Latin
  text, so bilingual interfaces stay consistent.

When a decision is not covered by an explicit token, lean toward the conservative
option: more space, the Primary Green for accent, and a Regular or Medium font
weight.

## Colors

The palette is anchored by high-contrast neutrals and a single brand accent, with
a disciplined set of semantic colors reserved strictly for meaning.

- **Primary (`#015850`):** The deep teal that defines Bedrock. Use it for primary
  actions, active states, selected tabs, links, and brand accents. `primary-hover`
  (`#02A998`) lightens on hover; `primary-pressed` (`#01534C`) deepens on press.
  The full `primary-50` → `primary-900` scale exists for tints and shades, but the
  500 step is the brand value.
- **Confirm (`#00AA86`):** Success and positive confirmation CTAs. Distinct from
  the brand teal so a "confirm" reads as an outcome, not navigation.
- **Danger (`#CC0004`):** Destructive and cancel actions only. Never decorative.
- **Submit (`#016987`):** Submit and info-type actions where a primary teal would
  be too brand-heavy.
- **Status colors** — `success` (`#52C41A`), `info-strong` (`#1677FF`),
  `warning-strong` (`#FAAD14`), and `error` (`#FF4D4F`) — each pair with a soft
  tinted background (`success-bg`, `info-bg`, `warning-bg`, `error-bg`) for alerts
  and inline validation.

Neutrals carry most of the interface. `text` (`#35373C`) is default body copy;
`text-strong` (`#171923`) is for dense titles; `text-secondary` (`#2D3748`) covers
inactive tabs and secondary labels; `text-disabled` (`#A6A6B0`) marks disabled UI.
Surfaces are white (`#FFFFFF`) for cards, modals, and inputs, with `surface-muted`
(`#F1F2F4`) for page backgrounds and tooltips. `border` (`#E2E8F0`) handles
dividers and outlines.

## Typography

**Noto Sans Thai** is the single typeface, loaded across weights 200–800. The base
body size is 14px. Use the type scale tokens rather than ad-hoc sizes.

Weight conveys role, not just emphasis:

- **Bold (700):** Page and section headings (H1–H3), modal and toast titles, data
  emphasis.
- **SemiBold (600):** Subtitles, tab labels, small action buttons.
- **Medium (500):** Primary and standard interactive buttons.
- **Regular (400):** Body copy, form content, descriptions.
- **Light (300):** Reserved for very large decorative display text only.

Headings (`h1`–`h3`) anchor page and section hierarchy. `subtitle-1` → `subtitle-3`
title panels and sub-sections. `body-2` (16px) is the workhorse for standard copy
and modal content; `body-3` (14px) handles form labels and secondary text;
`caption` (12px) is for tags and helper text. Button styles (`button-1`–`button-3`)
match their button size. Letter spacing is intentionally tight and positive across
the scale to keep Thai and Latin glyphs evenly set.

## Layout

Spacing follows a strict **8-point grid**. Every margin, padding, and gap is a
multiple of 8px, with 4px available for fine sub-unit adjustments. The common rhythm
runs 4, 8, 12, 16, 24, 32, 40, 48, 64px and scales up to 96px for large section
breaks.

Lay out interfaces on a precise, aligned grid with generous whitespace between
groups. Whitespace is the primary tool for hierarchy — prefer adding space over
adding borders or background fills to separate content. Default card padding is
24px; related controls sit 8–16px apart, distinct sections 32–48px apart.

## Elevation & Depth

Depth is communicated sparingly. Bedrock is a flat, calm interface: most content
sits directly on white or `surface-muted` page backgrounds with no shadow. Reserve
soft, low-spread shadows for genuinely floating surfaces — modals, dropdowns,
popovers, and tooltips — to lift them above the page. Avoid heavy drop shadows,
stacked elevations, or decorative glows; a thin `border` (`#E2E8F0`) is often
enough to define a card without any shadow at all.

## Shapes

Corner rounding uses a consistent scale. `base` (4px) is the default for inputs and
cards. `lg` (8px) rounds buttons and modals. `xl` (12px) and `2xl` (16px) soften
larger cards and panels, and `3xl` (24px) is for hero containers. `sm` (2px) suits
tags and badges, while `full` (9999px) produces pills, chips, and circular avatars.
Keep rounding consistent within a component family — don't mix radii on sibling
elements.

## Components

- **Button.** Primary buttons are `primary` teal on white text, 8px (`lg`) radius,
  Medium weight. Variants map to intent: `confirm` for success, `danger` for
  destructive, `submit` for info actions. Sizes are Large (24px), Medium (16px),
  Small (14px). Disabled state uses `surface-muted` with `text-disabled` text.
  States flow Default → Hover → Pressed → Disabled → Focus.
- **Card.** White surface, `xl` (12px) radius, 24px padding. Separate from the page
  with whitespace or a thin `border` rather than a shadow.
- **Modal.** White surface, `lg` radius. Header title in `text-strong` (Body 2/Bold),
  body in `text` (Body 2/Regular), footer actions in Button 3/SemiBold. Confirm
  actions use `confirm`; destructive actions use `danger`.
- **Form & Input.** White field, `base` (4px) radius, `border` outline that shifts
  to a focused blue (`#91CAFF`) on focus. Labels are Body 3/Regular; input content
  is Body 2/Regular. Errors use `danger`.
- **Tabs.** Active tab is `primary`; inactive is `text-secondary`; hover is
  `primary-hover`. Body 2/Regular labels with an underline or contained treatment.
- **Tags & Badges.** Caption/Bold text, `sm` radius, white or `surface-muted` fill
  with a `border` outline; `text-secondary` text.
- **Toast / Alert.** Title in Body 2/Bold, description in Body 2/Regular. Success,
  info, warning, and error each use their semantic base color over the matching
  soft tinted background. Can be dismissible or persistent.
- **Avatar.** Circular (`full` radius), white background, `border` outline,
  `text-secondary` initials. Online status uses `confirm` green.
- **Progress.** Active track/fill in `primary`; background track in `border`; both
  fully rounded.
- **Tooltip.** `surface-muted` background, `text` color, Body 3/Regular, `base`
  radius — or a dark `text-secondary` background with white text for the dark variant.

## Do's and Don'ts

**Do**

- Use `primary` (`#015850`) as the one brand accent for primary actions and active
  states.
- Keep backgrounds white or `surface-muted`, and let whitespace create hierarchy.
- Align everything to the 8-point grid.
- Set all UI text in Noto Sans Thai, choosing weight by role.
- Reserve semantic colors (`confirm`, `danger`, `warning`, `info`, `success`,
  `error`) strictly for their meaning.

**Don't**

- Don't introduce additional accent or brand colors, gradients, or decorative
  fills that compete with the Primary Green.
- Don't use `danger` red or `confirm` green for anything other than their intent.
- Don't apply heavy drop shadows or stacked elevations — keep surfaces flat and calm.
- Don't break the 8-point grid with arbitrary spacing values.
- Don't substitute other typefaces or rely on Light weight for body or UI text.
- Don't crowd the interface; when unsure, add more white space.
