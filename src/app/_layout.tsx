import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  // 知豆嘛统一用深色沉浸式界面
  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
