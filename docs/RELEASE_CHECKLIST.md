# Nivora Release Checklist

Use this before publishing a web or Android release.

## Data safety

- Confirm migrations are reviewed and applied in the correct order.
- Verify local backups can still be exported and imported.
- Check cloud persistence does not overwrite newer local state unexpectedly.
- Confirm no service-role or private keys are present in client code.

## Product checks

- Transactions, budgets, savings, accounts, recurring activity, and analytics open without errors.
- Empty states explain what the user should do next.
- Currency and date formatting remain consistent.
- Nivora Intelligence requests confirmation before actions that change financial data.

## Web

- Run type checking and the production build.
- Test PWA installability when manifest/service-worker behavior changes.

## Android

- Sync Capacitor after the latest web build.
- Open the Android project and confirm the native shell launches.
- Test back navigation and app resume behavior.

## Documentation

Update the README and technical docs when architecture, setup, environment variables, or release scope changes.
