import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.waterfallworkouts',
  appName: 'WaterfallWorkouts',
  webDir: 'www/browser',
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      'android-minSdkVersion': '19',
      'android-targetSdkVersion': '29',
      BackupWebStorage: 'none',
      StatusBarBackgroundColor: '#1f1f1f',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '8000',
      ShowSplashScreenSpinner: 'false',
      SplashScreenBackgroundColor: '0x1d1c1e'
    }
  }
};

export default config;
