# Nivora Architecture

Nivora follows a deliberately small local-first architecture.

## Boundaries

- `src/domain/` — pure finance rules, types, calculations and deterministic intelligence. Domain code should not render UI or manipulate the DOM.
- `src/data/` — persistence, migrations, cloud adapters and storage boundaries. Components should use these modules instead of accessing storage directly when a reusable data operation exists.
- `src/components/` — presentation and user interaction. Components receive data and callbacks; financial calculations belong in domain modules.
- `src/lib/` — infrastructure clients and external service configuration.
- `src/App.tsx` — application composition and shell wiring. New feature logic should not accumulate here; prefer domain/data/component modules.

## Performance rules

1. Derive expensive lists, rollups and filtered collections with memoization when their inputs are stable.
2. Avoid repeated storage reads during the same render.
3. Persist only when data actually changes.
4. Keep migration work idempotent and cheap on every boot.
5. Prefer stable IDs and account IDs over display labels for relationships.
6. Keep animations restrained and respect reduced-motion preferences.
7. Avoid adding dependencies for functionality already covered by the existing stack.

## Cleanup policy

- Remove phase-marker files and legacy styles once their replacement is integrated.
- Keep historical phase documents because they explain product evolution and architecture decisions.
- Do not remove compatibility fields or storage keys without an explicit migration.
- Never trade data correctness for a micro-optimization.

## Current refactor direction

The application shell is intentionally kept working while feature code remains modular. Future shell extraction should move navigation, layout and transaction composition into dedicated components without changing domain/storage contracts.
