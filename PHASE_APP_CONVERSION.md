# Nivora App Conversion — PWA Foundation

## Phase goal

Turn Nivora into an installable app without rewriting the existing React/Vite application.

## Included in this phase

- Web App Manifest
- Standalone app display mode
- Portrait-first mobile orientation
- Nivora app icons
- Mobile-safe viewport configuration
- Apple web-app metadata
- Production service worker registration
- Offline shell caching
- Runtime caching for same-origin GET requests
- Automatic cache cleanup on service-worker activation
- Progressive enhancement: the web app still works when service workers are unavailable

## Architecture

```text
Nivora React + Vite
        |
        +-- Web / PWA
        |     +-- Manifest
        |     +-- Service Worker
        |     +-- Offline Shell
        |
        +-- Future Android
        |     +-- Capacitor
        |
        +-- Future Desktop
              +-- Tauri
```

## Data boundary

The current app remains local-first. This phase does not move financial data into browser Cache Storage and does not cache Supabase responses intentionally. The service worker caches application resources, while Nivora's finance data continues to use the existing storage/sync architecture.

## Important production note

Service-worker behavior is enabled only in production builds. During local development, Vite remains unchanged.

Before publishing a production build, verify the generated app on Chrome/Edge and a mobile browser, including installability, offline launch, authentication flow, local data persistence, theme behavior, and service-worker updates.

## Next app-conversion step

After the PWA is validated, package the same frontend for Android with Capacitor. Native notifications, biometric protection, and platform storage should be added only through explicit native capabilities rather than duplicating the finance domain.
