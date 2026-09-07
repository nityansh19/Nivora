# Nivora — Cloud Persistence & Multi-Device Sync

## Goal

Make a signed-in user's finance workspace survive app reinstalls, browser resets and device changes.

## Storage model

Nivora remains local-first for responsiveness, but Supabase becomes the durable user-scoped backup/source of restoration.

Each authenticated user has one row in `public.workspace_snapshots` keyed by `auth.users.id`.

The snapshot currently includes:

- onboarding/profile
- transactions
- accounts
- recurring transactions
- transfers
- budgets
- savings goals
- savings entries
- notifications
- notification preferences
- theme

## Security

Row Level Security is enabled. Policies restrict select/insert/update/delete to rows where `auth.uid() = user_id`.

Never place a Supabase service-role/secret key in the browser or Android bundle. Nivora uses only the publishable browser key and relies on RLS for data isolation.

## Sync behavior

- App startup: restore the signed-in user's remote snapshot before React mounts.
- First migration: if no remote snapshot exists, meaningful local data is uploaded once.
- While using Nivora: changed local data is uploaded periodically.
- Background/close: a best-effort flush runs when the app is hidden or the page is being left.
- Sign-in: remote data is restored and the app reloads once so every feature reads the restored local cache.
- Sign-out: user financial data is cleared from the local device cache to avoid leaking data to the next signed-in user. Theme is preserved.

## Supabase setup required

Run the SQL migration in:

`supabase/migrations/20260907_workspace_snapshots.sql`

against the Supabase project used by `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

The migration must exist in the actual Supabase database before cloud persistence can work.

## Production notes

This phase intentionally uses a single versioned JSON workspace snapshot to make cross-device recovery reliable without rewriting every existing local storage repository at once. A later normalization phase can move high-volume entities such as transactions into dedicated relational tables while keeping this snapshot as a recovery/export layer.
