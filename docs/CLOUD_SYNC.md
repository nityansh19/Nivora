# Cloud Sync

Nivora is local-first for speed and offline resilience, with Supabase providing durable user-scoped persistence and restore.

## What is synchronized

- profile and onboarding state
- transactions
- accounts
- recurring transactions
- transfers
- budgets
- savings goals and entries
- notifications and preferences
- theme

Each authenticated user owns a single row in `public.workspace_snapshots`, keyed by the Supabase user id.

## Sync lifecycle

1. On startup, Nivora restores the authenticated user's remote workspace before the React app mounts.
2. If the remote workspace is empty, existing meaningful local data is uploaded as the initial snapshot.
3. While the app is in use, changes are periodically uploaded.
4. A best-effort flush runs when the app is hidden or closed.
5. After sign-in, the remote workspace is restored and the app reloads once so every screen reads the restored cache.
6. On sign-out, user financial data is removed from the local device cache to avoid cross-user leakage. Theme is preserved.

## Security

Row Level Security is enabled on the workspace table. Policies restrict select, insert, update and delete operations to rows where `auth.uid() = user_id`.

Only the Supabase publishable key belongs in the web or Android app. Never ship a service-role or secret key in the client.

## Required database migration

Apply:

`supabase/migrations/20260907_workspace_snapshots.sql`

against the Supabase project configured through:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The SQL migration must exist in the actual Supabase database for cloud persistence to work.

## Storage model

Version 1 uses a JSON workspace snapshot per user. This keeps recovery reliable while preserving Nivora's existing local-first repositories. High-volume entities can be normalized into dedicated relational tables in a future major version without removing the snapshot recovery layer.
