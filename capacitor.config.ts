import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'prueba-photo-gallery',
  webDir: 'dist',
  plugins: {
    LiveUpdates: {
      appId: '1786e27e',
      channel: 'Production',
      autoUpdateMethod: 'none',
      maxVersions: 2
    }
  }
};

export default config;
