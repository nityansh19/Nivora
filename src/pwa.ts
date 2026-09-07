import { Capacitor } from '@capacitor/core';

const SW_URL = '/sw.js';
const NIVORA_CACHE_PREFIX = 'nivora-';

async function clearNativeWebCache() {
  if (!('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(registration => registration.unregister()));

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key.startsWith(NIVORA_CACHE_PREFIX)).map(key => caches.delete(key)),
    );
  }
}

export function registerPWA() {
  // Capacitor ships web assets inside the native app package. Registering the
  // PWA service worker there can keep an older cached shell after an APK update.
  // Native builds therefore clear legacy Nivora web caches and use bundled assets.
  if (Capacitor.isNativePlatform()) {
    void clearNativeWebCache();
    return;
  }

  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SW_URL).catch(() => {
      // PWA support is progressive enhancement; the app remains fully usable without it.
    });
  }, { once: true });
}
