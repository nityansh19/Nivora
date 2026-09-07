# Capacitor Android Setup

The repository now contains the Capacitor configuration, but the generated native `android/` project should be created locally because it is produced by the Capacitor CLI and Android tooling.

## Commands

```bash
npm install
npm run build
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

Then use Android Studio to choose an emulator or connected test device and run the app.

After the first native project exists, future web changes can be pushed into Android with:

```bash
npm run build
npm run cap:sync
```

For direct device/emulator execution:

```bash
npm run cap:run:android
```

## Why the Android folder is not generated here

Capacitor's Android project contains generated Gradle/native project files and requires a local Android SDK/JDK environment. The GitHub connector can safely prepare the shared application configuration, but the native project should be generated and validated with your local Android toolchain before committing it.
