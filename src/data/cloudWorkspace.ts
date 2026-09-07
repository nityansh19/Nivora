import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const WORKSPACE_TABLE = 'workspace_snapshots';
const SYNC_META_KEY = 'nivora.cloud-sync-meta.v1';
const LOCAL_KEYS = [
  'nivora.onboarding.v1',
  'nivora.transactions.v2',
  'nivora.accounts.v1',
  'nivora.recurring.v1',
  'nivora.transfers.v1',
  'nivora.budgets.v1',
  'nivora.savings.goals.v1',
  'nivora.savings.entries.v1',
  'nivora.notifications.v1',
  'nivora.notification-preferences.v1',
  'nivora.theme',
] as const;

type WorkspacePayload = Record<string, string | null>;

type SyncMeta = {
  userId?: string;
  lastRemoteUpdatedAt?: string;
  lastUploadedHash?: string;
};

function readMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMeta(meta: SyncMeta) {
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
}

function captureWorkspace(): WorkspacePayload {
  return Object.fromEntries(LOCAL_KEYS.map(key => [key, localStorage.getItem(key)]));
}

function applyWorkspace(payload: WorkspacePayload) {
  for (const key of LOCAL_KEYS) {
    const value = payload[key];
    if (typeof value === 'string') localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  }
}

function hashPayload(payload: WorkspacePayload) {
  const text = JSON.stringify(payload);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function hasMeaningfulLocalData(payload: WorkspacePayload) {
  return LOCAL_KEYS.some(key => key !== 'nivora.theme' && Boolean(payload[key]));
}

export async function getCloudUserId() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function restoreCloudWorkspace() {
  if (!isSupabaseConfigured || !supabase) return { restored: false, reason: 'not-configured' as const };
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return { restored: false, reason: 'no-session' as const };

  const { data, error } = await supabase
    .from(WORKSPACE_TABLE)
    .select('payload, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return { restored: false, reason: 'remote-error' as const, message: error.message };

  if (!data?.payload) {
    const local = captureWorkspace();
    if (hasMeaningfulLocalData(local)) await uploadCloudWorkspace(true);
    return { restored: false, reason: 'remote-empty' as const };
  }

  applyWorkspace(data.payload as WorkspacePayload);
  const local = captureWorkspace();
  writeMeta({ userId: user.id, lastRemoteUpdatedAt: data.updated_at, lastUploadedHash: hashPayload(local) });
  return { restored: true, reason: 'restored' as const };
}

export async function uploadCloudWorkspace(force = false) {
  if (!isSupabaseConfigured || !supabase) return { uploaded: false, reason: 'not-configured' as const };
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return { uploaded: false, reason: 'no-session' as const };

  const payload = captureWorkspace();
  const hash = hashPayload(payload);
  const meta = readMeta();
  if (!force && meta.userId === user.id && meta.lastUploadedHash === hash) {
    return { uploaded: false, reason: 'unchanged' as const };
  }

  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from(WORKSPACE_TABLE).upsert({
    user_id: user.id,
    payload,
    updated_at: updatedAt,
  }, { onConflict: 'user_id' });

  if (error) return { uploaded: false, reason: 'remote-error' as const, message: error.message };
  writeMeta({ userId: user.id, lastRemoteUpdatedAt: updatedAt, lastUploadedHash: hash });
  return { uploaded: true, reason: 'uploaded' as const };
}

export async function bootstrapCloudWorkspace() {
  const result = await restoreCloudWorkspace();
  return result;
}

export function startCloudWorkspaceSync() {
  if (!isSupabaseConfigured || !supabase) return () => undefined;
  let stopped = false;
  let syncing = false;

  const flush = async () => {
    if (stopped || syncing) return;
    syncing = true;
    try { await uploadCloudWorkspace(); } finally { syncing = false; }
  };

  const interval = window.setInterval(flush, 12000);
  const onVisibility = () => { if (document.visibilityState === 'hidden') void flush(); };
  const onPageHide = () => { void flush(); };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      window.setTimeout(async () => {
        const restored = await restoreCloudWorkspace();
        if (!restored.restored) await uploadCloudWorkspace(true);
      }, 0);
    }
  });

  return () => {
    stopped = true;
    window.clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
    data.subscription.unsubscribe();
  };
}
