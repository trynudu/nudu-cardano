# Nudu Clear — web design companion

> Product source of truth: `../../specs/`. This file keeps the landing page on the Nudu design system. Tokens are copied from `nudu-landing` (`DESIGN.md` and `src/styles/global.css`) and the Nudu client.

## 1. Visual theme

Industrial-editorial, the same language as Nudu. Cool graphite carries the page. Carmine `#9b1134` is the only chromatic voice: brand mark, primary button, eyebrow, active route, and link emphasis. The simulator is the single full night section. The execution trace is a night instrument inside the flow, the same night ladder the Nudu client uses for its shell.

**Dials:** variance 6, motion 6, density 5. Match Nudu. Do not reintroduce the previous midnight-blue / electric-cyan telemetry theme.

## 2. Color

| Token | Value | Role |
| --- | --- | --- |
| `--carmine` | `#9b1134` | The only chroma |
| `--carmine-deep` | `#6d0b24` | Pressed button, emphasis |
| `--carmine-bright` | `#c1183f` | Carmine on night |
| `--carmine-tint` | `#fbeef1` | Carmine wash |
| `--carmine-line` | `#f0d6dc` | Carmine hairline |
| `--ink` | `#0e1114` | Primary text |
| `--muted` | `#5d686f` | Supporting text |
| `--canvas` | `#ffffff` | Page ground |
| `--surface-1` | `#f6f7f8` | Alternating ground |
| `--surface-2` | `#eef1f3` | Inset panel |
| `--night` | `#0e1114` | Simulator and footer |
| `--night-1` | `#171c20` | Raised night surface |
| `--night-line` | `#2d353b` | Night boundary |
| `--l1` | `#2f7d55` | Allowed |
| `--l2` | `#a8650a` | Escalated |
| `--l3` | `#9b1134` | Denied |

No beige, cream, brass, cyan, or electric blue. No gradient text. No neon glow.

## 3. Typography

- Display: Manrope 700–800, negative tracking.
- Body: DM Sans.
- Telemetry and case data: IBM Plex Mono. `tabular-nums` on money, counters, and hashes.
- Eyebrow: Manrope 700, 12px, tracking `0.16em`, uppercase, carmine. Use it sparingly.
- H1: fluid up to 76px, weight 800, line-height 0.98.

## 4. Shape and chrome

- Radii: 3 / 6 / 10 / 14. Buttons are 6px, never pills.
- Hairlines separate real boundaries. Shadows stay rare.
- Sticky chrome is the Nudu lockup plus a `Clear` product chip, a mono simulated-status strip, and a carmine primary action.
- Focus ring is 2px carmine, white on night.
- Demo numbers and the status strip are simulations. Never present them as a live Cardano transaction.

## 5. Do and don’t

**Do:** explain x402 challenge validation, pre-sign policy, Masumi escrow, multi-rail selection, encrypted off-chain audit, and the public commitment. Label demo state. Keep denial and approval explicit.

**Don’t:** call a hash encryption, call metadata shielded, imply a live mainnet connection, or bring back crosshairs, blueprint glows, or a second accent color.
