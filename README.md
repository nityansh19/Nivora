# Nivora

**Nivora — Personal Finance OS**

A premium, calm personal finance application for daily expenses, income, savings, budgets, goals, and financial analytics.

## Current status

**Phase 0 — Discovery + Foundation** is implemented on `phase-0-foundation`.

The repository started essentially empty, so there was no existing application architecture to preserve. The foundation establishes a React + Vite + TypeScript frontend and a reusable visual system before the data layer is introduced.

### Included now

- Premium responsive app shell
- Desktop sidebar + mobile bottom navigation
- Light/dark theme foundation
- Financial snapshot cards
- Quick transaction composer shell
- Empty states designed around real-data-first principles
- Responsive dashboard layout
- Reduced-motion support
- Keyboard-visible focus states
- Lucide icon system
- Manrope + DM Sans typography pairing
- Design-system documentation

### Next phases

1. **Transactions** — real expense/income persistence, categories, accounts, search/filter, details
2. **Savings** — savings entries, goals, progress and history
3. **Budget** — monthly and category budgets
4. **Analytics** — real charts and comparisons
5. **Polish** — loading, error, accessibility and performance refinement
6. **Productization** — extensibility for multi-user, sync, exports, PWA and future AI features

## Design direction

Nivora is intentionally not a generic CRUD dashboard. The interface uses a restrained fintech aesthetic: warm surfaces, evergreen semantic accents, strong financial typography, quiet depth, purposeful motion, and honest empty states.

See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for the full Phase 0 visual contract.

## Local development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Design intelligence

The UI direction references the UI/UX Pro Max methodology from the upstream project: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
