# Nivora Design System — Phase 0

Nivora is being designed as a calm personal financial operating system: trustworthy, clear, data-led, and fast enough for daily use.

## Design intelligence applied

The UI direction follows the UI/UX Pro Max principles for personal finance: semantic color tokens, mobile-first responsive behavior, SVG iconography, restrained motion, accessible focus states, reduced-motion support, and charts chosen for the question they answer rather than decoration. The upstream skill explicitly includes a dedicated Personal Finance Tracker reasoning rule and recommends searchable product/style/color/typography/chart/UX guidance.

Reference: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

## Visual direction

- **Style:** restrained fintech minimalism with selective soft surfaces and depth.
- **Personality:** calm, precise, quietly premium.
- **Avoid:** neon, cyberpunk, excessive glass, giant gradients, decorative 3D, emoji icons, and dashboard clutter.
- **Primary surface:** warm off-white in light mode; deep charcoal-green in dark mode.
- **Accent:** muted evergreen rather than generic fintech blue.

## Tokens

### Color semantics

- `--bg`: application canvas
- `--surface`: translucent elevated surface
- `--surface-solid`: solid card/form surface
- `--elevated`: subtle control background
- `--text`: primary content
- `--muted`: secondary content
- `--border`: default divider/border
- `--border-strong`: emphasized boundary
- `--primary`: brand/action color
- `--primary-soft`: low-emphasis brand surface
- `--success`: positive financial state
- `--success-soft`: positive state surface
- `--warning`: approaching threshold
- `--danger`: destructive/over-budget state

No financial UI should hardcode raw color values inside components.

## Typography

- **Display/UI:** Manrope
- **Body:** DM Sans
- **Financial values:** Manrope with strong weight and tight tracking.
- Base body size is 16px-equivalent at the browser level; compact dashboard metadata is intentionally smaller but never used for essential instructions.

## Spacing

Use an 8px rhythm with smaller 4px/6px increments for dense controls:

`4 / 6 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`

## Radius

- Controls: 9–10px
- Cards: 14px
- Modal: 18px
- Avatars/pills: full radius

Avoid excessive pill-shaped UI.

## Motion

- Hover/tactile: ~150–200ms
- Modal/page transitions: ~200–280ms
- Number/chart reveals: short and purposeful
- No perpetual decorative motion
- `prefers-reduced-motion` is respected globally

## Navigation

Desktop uses a compact left rail. Mobile uses a four-destination bottom navigation and a persistent primary Add Transaction action in the page content. Secondary navigation remains available from the drawer.

## Data visualization

Phase 0 intentionally does not fabricate financial charts. Empty states explain what will appear once real data exists. Future charts will follow the data question:

- Line/area → spending and savings trends over time
- Bars → income vs expenses or category comparison
- Donut → part-to-whole category distribution, only when category count remains legible

Every chart must expose readable labels/tooltips and an accessible text/table alternative where needed.

## Accessibility

- Keyboard-visible focus
- Semantic buttons/labels
- Touch-friendly controls
- Reduced motion
- Contrast-aware semantic colors
- Icons are paired with text or accessible labels when their meaning is not obvious

## Phase 0 component principles

`StatCard`, `QuickAction`, `Panel`, `EmptyState`, `MoneyDisplay`, `TransactionRow`, `BudgetProgress`, and `GoalCard` are intended as reusable primitives as the product expands. The current shell establishes the visual contract before the data layer is introduced.
