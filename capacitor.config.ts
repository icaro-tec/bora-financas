import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.borafinancas.app',
  appName: 'Bora Finanças',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
