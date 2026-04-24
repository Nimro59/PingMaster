import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as NavigationBar from 'expo-navigation-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { Platform } from "react-native";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Si on est sur Android, on cache la barre
    if (Platform.OS === 'android') { 
      // "overlay-swipe" permet de la faire réapparaitre en glissant le doigt vers le haut
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
      
      // Optionnel : Rendre la barre transparente si elle apparait
      NavigationBar.setBackgroundColorAsync("#ffffff00");
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
