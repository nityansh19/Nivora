# Nivora

**Personal Finance OS for web and Android.**

Nivora is a premium, local-first personal finance application for tracking money, planning budgets, building savings, reviewing financial trends, and carrying the same workspace across devices.

> **Status: v1.0 complete** — the core product, Android app shell, authentication, cloud persistence, analytics, budgeting, savings, accounts, recurring activity, notifications and Nivora Intelligence are implemented.

## What Nivora does

- Track expenses and income with categories, notes, dates and accounts
- Manage accounts, transfers and recurring transactions
- Build monthly and category budgets
- Track savings and savings goals
- Review analytics, category breakdowns and monthly summaries
- Use a financial calendar and notification center
- Search, edit, duplicate and delete transactions
- Export and import local backups
- Use light and dark themes
- Install as a PWA or run as an Android app through Capacitor
- Sign in with Supabase authentication
- Restore a user workspace across reinstalls and devices through cloud persistence
- Use Nivora Intelligence for grounded financial explanations and confirmation-based actions

## Product philosophy

Nivora is designed as a calm financial workspace rather than a generic CRUD dashboard. The UI uses restrained fintech styling, strong hierarchy, honest empty states, responsive layouts, purposeful motion and a local-first architecture.

## Stack

- React
- TypeScript
- Vite
- Capacitor
- Supabase
- Framer Motion
- Recharts
- Lucide React

## Architecture

Nivora separates finance domain logic, local persistence, cloud persistence and presentation layers. Local storage remains the fast offline cache while Supabase provides authenticated recovery and multi-device durability.

Read the technical notes in:

- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
- [`ANDROID_APP.md`](./ANDROID_APP.md)
- [`CAPACITOR_ANDROID_SETUP.md`](./CAPACITOR_ANDROID_SETUP.md)
- [`docs/CLOUD_SYNC.md`](./docs/CLOUD_SYNC.md)

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

TypeScript validation:

```bash
npm run typecheck
```

## Android

Build and sync the latest web assets into the Android project:

```bash
npm run cap:sync
```

Open Android Studio:

```bash
npm run cap:open:android
```

Install the debug build on a connected device from the `android` directory:

```powershell
.\gradlew installDebug
```

## Supabase configuration

Create `.env.local` from `.env.example` and provide only the public client configuration:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Never place a Supabase service-role or secret key in the client application.

For cloud workspace persistence, apply:

`supabase/migrations/20260907_workspace_snapshots.sql`

## Current release

**Nivora v1.0** is feature-complete for its current product scope. Future work should be treated as new releases rather than unfinished phases: production distribution, deeper native integrations, normalized cloud tables, advanced AI, and public productization.
