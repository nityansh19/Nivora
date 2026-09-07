# Android mobile UI polish

This pass is focused on the native phone experience after the first Capacitor install.

## Problems addressed
- Android status bar overlapping the app header
- too many header actions competing for space on small screens
- crowded six-item bottom navigation
- oversized empty-state panels and excessive vertical spacing
- inconsistent mobile card spacing and radii
- insufficient bottom safe-area spacing around the native gesture bar

## Mobile hierarchy
The phone shell now prioritizes:
1. navigation/menu + page title
2. the primary financial snapshot
3. one obvious transaction CTA
4. compact metrics
5. insights/content
6. a five-item bottom navigation

Less frequently used destinations remain available from the side drawer.
