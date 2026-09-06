# Phase 14 — Cloud Auth + Sync

Nivora now has the architecture for moving from the local prototype boundary toward a real multi-device product.

## Implemented

- Supabase JS client with Vite environment configuration
- Email/password cloud authentication adapter
- Persisted cloud sessions with automatic refresh
- Explicit sign-out control
- Local-first sync queue with deduplication and retry counters
- User-scoped Supabase schema for profiles, accounts and transactions
- Row Level Security policies based on `auth.uid()`
- Automatic profile creation for new auth users
- Premium Security & Cloud settings surface
- Safe `.env.example` with publishable client configuration only

## Local-first boundary

The existing local storage remains the immediate source used by the current UI. Phase 14 introduces the cloud boundary and sync queue without silently replacing local data or inventing a migration that could destroy existing user data.

## Production data rules

1. Every cloud row must belong to an authenticated user.
2. RLS must remain enabled on every user-owned table.
3. Browser code may only receive the Supabase publishable key.
4. Secret/service-role keys must never be shipped to the browser.
5. Sync must be idempotent and use record IDs plus `updated_at` for conflict handling.
6. Deletions need tombstones before full multi-device sync is enabled.
7. A backup/export path remains available before destructive migrations.

## Still required before full cloud rollout

- Configure a Supabase project and `.env.local`.
- Run `supabase/migrations/001_phase14_core.sql`.
- Finish syncing every Nivora domain into cloud tables.
- Add per-user local-storage namespaces.
- Add pull/push reconciliation and conflict UI.
- Add password reset/email verification screens.
- Add session-expiry handling and signed-out state recovery.
- Add account deletion/data deletion and cloud export.
- Verify production RLS with authenticated and unauthenticated test cases.
