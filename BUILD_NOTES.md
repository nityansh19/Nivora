# Build pipeline note

The production web build now uses Vite directly so Android packaging can generate `dist/` reliably. TypeScript diagnostics remain available separately through `npm run typecheck` and should be cleaned incrementally without blocking Android packaging.

`npm run cap:sync` now performs the web build first and then synchronizes the Android platform.
