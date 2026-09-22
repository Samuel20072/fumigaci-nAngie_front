import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.samts.fumicontrol',
  appName: 'FumiControl',
  webDir: 'dist/fumiintengral_front/browser',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1d4ed8',
    },
  },
};

export default config;
