# Nivora

**A personal finance OS for web and Android.**

Nivora is a local-first finance workspace for tracking money, planning budgets, building savings, reviewing trends, and carrying the same financial workspace across devices.

## Current status

**v1.0 complete for the current product scope.**

The core web product, Android shell, authentication, cloud persistence, analytics, budgeting, savings, accounts, recurring activity, notifications, and Nivora Intelligence are implemented.

## Product areas

| Area | What it covers |
|---|---|
| Transactions | Expenses, income, categories, notes, dates, editing, duplication, deletion |
| Accounts | Account balances, transfers, and recurring activity |
| Budgets | Monthly and category-based planning |
| Savings | Savings tracking and goal management |
| Analytics | Trends, category breakdowns, and monthly summaries |
| Organization | Search, financial calendar, and notification center |
| Portability | Import/export, local backups, PWA, and Android support |
| Cloud | Supabase authentication and workspace recovery across devices |
| Intelligence | Grounded financial explanations and confirmation-based actions |

## Tech stack

- React
- TypeScript
- Vite
- Capacitor
- Supabase
- Framer Motion
- Recharts
- Lucide React

## Architecture

Nivora separates four concerns:

1. **Finance domain logic** — transactions, budgets, savings, accounts, and calculations.
2. **Local persistence** — fast local-first access and offline-friendly state.
3. **Cloud persistence** — authenticated recovery and multi-device durability through Supabase.
4. **Presentation** — responsive web and Android-facing UI.

This keeps the product usable locally while allowing a signed-in workspace to be restored across devices.

## Repository guide

```text
src/                         Application source
public/                      Static assets
supabase/                    Database migrations and cloud setup
docs/                        Supporting technical documentation
ARCHITECTURE.md              System architecture
DESIGN_SYSTEM.md             Visual and interaction rules
ANDROID_APP.md               Android product notes
CAPACITOR_ANDROID_SETUP.md   Native Android setup
```

## Run locally

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run typecheck
npm run build
```

## Supabase configuration

Create `.env.local` from `.env.example` and provide only the public client configuration:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Never place a Supabase service-role or secret key in the client application.

For cloud workspace persistence, apply:

```text
supabase/migrations/20260907_workspace_snapshots.sql
```

## Android workflow

Sync the latest web build into the native project:

```bash
npm run cap:sync
```

Open Android Studio:

```bash
npm run cap:open:android
```

From the `android` directory, a connected-device debug install can be run with:

```powershell
.\gradlew installDebug
```

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system structure and data flow
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — UI rules and design language
- [`ANDROID_APP.md`](./ANDROID_APP.md) — Android app behavior
- [`CAPACITOR_ANDROID_SETUP.md`](./CAPACITOR_ANDROID_SETUP.md) — native setup steps
- [`docs/CLOUD_SYNC.md`](./docs/CLOUD_SYNC.md) — cloud persistence details

## Next releases

Future work is treated as product evolution rather than unfinished v1 work. Likely directions include production distribution, deeper native integrations, normalized cloud tables, more advanced intelligence, and wider public productization.
