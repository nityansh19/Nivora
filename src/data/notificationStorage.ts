import type { NivoraNotification, NotificationPreferences } from '../domain/notifications';

const notificationsKey='nivora.notifications.v1';
const preferencesKey='nivora.notification-preferences.v1';

export function loadNotifications():NivoraNotification[]{
  try{return JSON.parse(localStorage.getItem(notificationsKey)??'[]')}catch{return []}
}
export function saveNotifications(items:NivoraNotification[]){localStorage.setItem(notificationsKey,JSON.stringify(items))}
export function loadNotificationPreferences():NotificationPreferences|undefined{
  try{const raw=localStorage.getItem(preferencesKey);return raw?JSON.parse(raw):undefined}catch{return undefined}
}
export function saveNotificationPreferences(value:NotificationPreferences){localStorage.setItem(preferencesKey,JSON.stringify(value))}
