import type { NivoraNotification, NotificationPreferences } from '../domain/notifications';

const notificationsKey='nivora.notifications.v1';
const preferencesKey='nivora.notification-preferences.v1';

export function loadNotifications():NivoraNotification[]{
  try{const raw=localStorage.getItem(notificationsKey);const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed:[]}catch{return []}
}
export function saveNotifications(items:NivoraNotification[]){localStorage.setItem(notificationsKey,JSON.stringify(items))}
export function loadNotificationPreferences():NotificationPreferences|undefined{
  try{const raw=localStorage.getItem(preferencesKey);const parsed=raw?JSON.parse(raw):undefined;return parsed&&typeof parsed==='object'?parsed:undefined}catch{return undefined}
}
export function saveNotificationPreferences(value:NotificationPreferences){localStorage.setItem(preferencesKey,JSON.stringify(value))}
