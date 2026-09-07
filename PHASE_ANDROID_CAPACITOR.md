# Phase — Android / Capacitor

## Goal
Package the existing Nivora web application as a real Android application without duplicating finance logic.

## Completed foundation

- Capacitor core and Android packages added.
- Capacitor CLI scripts added.
- Android application identity configured as `com.nivora.finance`.
- `dist` selected as the web asset directory.
- Shared native platform boundary added at `src/native.ts`.
- Android setup and validation guide added.

## Deliberate boundary

This phase does not introduce native financial business logic, native storage duplication, push notifications, biometric authentication, or release signing yet.

## Validation gate

The generated `android/` project must be created and tested locally with Android Studio before native UX work is considered complete.

## Next

Validate the generated Android shell, then implement Android-specific navigation, safe-area/keyboard behavior, notifications, and optional biometric protection through focused native integrations.
