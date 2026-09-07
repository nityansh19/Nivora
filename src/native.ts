import { Capacitor } from '@capacitor/core';

export const isNativeApp = Capacitor.isNativePlatform();
export const nativePlatform = Capacitor.getPlatform();

/**
 * Keeps native-only behavior behind one small boundary so the finance domain
 * never needs to know whether Nivora is running on web or Android.
 */
export function isAndroidApp(): boolean {
  return nativePlatform === 'android';
}
