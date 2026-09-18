# Nivora Local Development

Use this checklist to get a predictable local environment before changing finance features.

## Setup

1. Clone the repository and install dependencies.
2. Create local environment configuration from the documented example values.
3. Start the web app and confirm the dashboard loads without console errors.
4. If cloud sync is enabled, use a development Supabase project rather than production data.
5. For Android work, verify the web build first before syncing Capacitor assets.

## Safe development habits

- Use sample financial data for testing.
- Do not place real account numbers, private transaction exports, or production keys in the repository.
- Keep schema-changing work separate from visual-only changes.
- Test create, edit, delete, and reload behavior for any feature that persists data.

## Before committing

Run the project checks, verify mobile responsiveness for changed screens, and confirm that offline/local behavior still works where expected.

Related docs: `QA_CHECKLIST.md`, `RELEASE_CHECKLIST.md`, and `CLOUD_SYNC.md`.
