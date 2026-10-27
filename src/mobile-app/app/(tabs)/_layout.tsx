import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { C } from '@/constants/theme';
import type { IconName } from '@/types';

const TABS: { name: string; title: string; icon: IconName; on: IconName }[] = [
  { name: 'index', title: 'Accueil', icon: 'home-outline', on: 'home' },
  { name: 'tournoi', title: 'Tournoi', icon: 'trophy-outline', on: 'trophy' },
  { name: 'stats', title: 'Stats', icon: 'stats-chart-outline', on: 'stats-chart' },
  { name: 'settings', title: 'Réglages', icon: 'settings-outline', on: 'settings' },
];

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: C.bgMain,
          borderTopColor: C.divider,
          borderTopWidth: 1,
          elevation: 0,
          height: 60 + bottom,
          paddingTop: 6,
          paddingBottom: bottom + 6,
        },
        sceneStyle: { backgroundColor: C.bgMain },
      }}
    >
      {TABS.map(t => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? t.on : t.icon} size={22} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
