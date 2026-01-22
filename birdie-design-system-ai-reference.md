
# Birdie Design System — AI Reference v1

This document defines the visual and behavioral tokens for the Birdie platform. Adhere strictly to these rules to maintain brand consistency.

## 🎨 Color Tokens (LOCKED)
- **Primary Brand Color**: `#660033` (Deep Burgundy)
- **Primary Hover**: `#2B0116` (Darker Burgundy)
- **Primary Light**: `#E0B5CB` (Soft Pink/Burgundy Accent)

- **Main Background**: `#F8FAFB` (Light Gray / Off-White)
- **Surface (Cards/Modals)**: `#FFFFFF` (Pure White)
- **Surface Elevated**: `#F1F5F9` (Used for hover states or backgrounds of inner components)

- **Text Primary**: `#0A0A0A` (Near Black)
- **Text Secondary**: `#615A5C` (Muted Gray)
- **Text Inverse**: `#FFFFFF` (White for text on burgundy backgrounds)

- **Semantic Colors**:
  - Success: `#059669` (Emerald)
  - Error: `#DC2626` (Red)
  - Warning: `#F59E0B` (Amber)
  - Info: `#3B82F6` (Blue)

**RULE**: Do not introduce new colors. All UI elements must strictly use these hex values.

## ✍️ Typography Rules
- **Font Family**: Plus Jakarta Sans (Primary), system-ui sans-serif fallback.
- **Base Text**: 16px, line-height 1.5, weight 400.
- **Headings**:
  - H1: 48px, weight 700, tight tracking.
  - H2: 36px, weight 700.
  - H3: 30px, weight 600.
  - H4: 24px, weight 600.
  - H5: 20px, weight 500.
  - H6: 18px, weight 500.

**RULES**: Headings are high-contrast dark text on light backgrounds. Maintain generous white space.

## 🧱 Layout & Component Contracts
- **Philosophy**: Mobile-first, card-based, app-like dashboards. Light, airy, premium.
- **Spacing**: 8px base grid. Section spacing: 32px+. Card padding: 24px.
- **Radius**: Standard radius is `12px` for buttons, `24px` to `40px` for large cards/modals.

### Buttons:
- **Primary**: Solid Deep Burgundy (`#660033`), White text.
- **Secondary**: Outlined Burgundy or slate-based light backgrounds.
- **Radius**: 12px to 16px.
- **Behavior**: Subtle lift on hover (`-1px` Y-translate).

### Forms:
- **Inputs**: Pure white background (`#FFFFFF`), soft border (`#E2E8F0`).
- **Focus State**: Deep Burgundy border (`#660033`).

### Cards:
- **Style**: Background `#FFFFFF`, border `#E2E8F0`.
- **Shadow**: Soft, high-diffusion shadows (`shadow-sm` or `shadow-md` equivalents).

## 🏷️ Naming Rule
The product name is **Birdie**. The string "Birdie AI" is strictly prohibited in all UI, metadata, and communication.
