# Android Conversion Checklist

## Before first Android build

- [ ] Install Node.js dependencies with `npm install`
- [ ] Build the web app with `npm run build`
- [ ] Generate Android project with `npm run cap:add:android`
- [ ] Sync web assets with `npm run cap:sync`
- [ ] Open Android Studio with `npm run cap:open:android`

## Device validation

- [ ] App launches without a blank screen
- [ ] Login and onboarding work
- [ ] Existing local data persists after relaunch
- [ ] Theme switching works
- [ ] Keyboard does not cover form controls
- [ ] Android system back navigation feels natural
- [ ] Bottom navigation remains above the system gesture area
- [ ] Calendar, charts and modals remain usable on smaller screens
- [ ] Offline launch works for previously cached application resources
- [ ] No financial data is intentionally placed into service-worker Cache Storage

## Release validation

Only after functional QA:

- [ ] Configure application icon/splash assets
- [ ] Set production package metadata
- [ ] Configure signing
- [ ] Generate a signed APK for testing
- [ ] Generate a signed AAB for Play distribution
- [ ] Test the release build on multiple Android screen sizes
