const SW_URL = '/sw.js';

export function registerPWA() {
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SW_URL).catch(() => {
      // PWA support is progressive enhancement; the app remains fully usable without it.
    });
  }, { once: true });
}
