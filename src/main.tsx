import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { migrateTransactionAccounts } from './data/accountMigration';
import { registerPWA } from './pwa';

migrateTransactionAccounts();
registerPWA();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
