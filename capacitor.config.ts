import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nivora.finance',
  appName: 'Nivora',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
