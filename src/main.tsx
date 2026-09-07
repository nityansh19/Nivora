import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App';
import './index.css';
import './native.css';
import { migrateTransactionAccounts } from './data/accountMigration';
import { bootstrapCloudWorkspace, startCloudWorkspaceSync } from './data/cloudWorkspace';
import { registerPWA } from './pwa';

migrateTransactionAccounts();
registerPWA();

if (Capacitor.isNativePlatform()) {
  document.documentElement.dataset.platform = Capacitor.getPlatform();
}

async function start() {
  await bootstrapCloudWorkspace();
  startCloudWorkspaceSync();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
