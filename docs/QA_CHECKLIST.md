# Nivora QA Checklist

## Transactions

- Add expense and income entries.
- Edit, duplicate, and delete a transaction.
- Verify account balances update correctly.
- Check transfers do not double-count income or expense totals.

## Budgets and savings

- Create and edit a monthly budget.
- Verify category progress reflects transaction changes.
- Create a savings goal and update progress.
- Confirm empty states are clear when no data exists.

## Persistence

- Reload the app and confirm local data restores.
- Sign in and verify cloud workspace recovery.
- Check conflict/error states when cloud requests fail.

## UI

- Test light and dark themes.
- Check mobile and desktop layouts.
- Verify charts remain readable with zero, small, and large values.
- Check keyboard focus and modal dismissal.

## Build checks

Run type checking and a production build before release. For Android changes, sync Capacitor and validate the app shell on a device or emulator.
