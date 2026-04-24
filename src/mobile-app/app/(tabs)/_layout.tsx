import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#2c3e50' },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 10,
          height: Platform.OS === 'ios' ? 90 : 70, 
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 10, marginBottom: 5 },
      }}
    >
      {/* 1. VESTIAIRES */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Vestiaires",
          tabBarLabel: "ACTUALITÉS",
          tabBarIcon: ({ color, size }) => <Ionicons name="newspaper" size={24} color={color} />,
        }}
      />

      {/* 2. CALENDRIER */}
      <Tabs.Screen
        name="events"
        options={{
          title: "Agenda Club",
          tabBarLabel: "CALENDRIER",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="tournoi"
        options={{
          title: "Tournois",
          tabBarLabel: "TOURNOI",
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={24} color={color} />,
        }}
      />

      {/* 3. ÉQUIPE (On le remet !) */}
      <Tabs.Screen
        name="equipe"
        options={{
          title: "Effectif Club",
          tabBarLabel: "ÉQUIPE",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />

      {/* STATS (Assiduité) */}
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats Club",
          tabBarLabel: "STATS",
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={24} color={color} />,
        }}
      />

      {/* 4. MAILLOT */}
      <Tabs.Screen
        name="maillot"
        options={{
          title: "Boutique",
          tabBarLabel: "MAILLOT",
          tabBarIcon: ({ color, size }) => <Ionicons name="shirt" size={24} color={color} />,
        }}
      />

      {/* MESSAGERIE */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Discussion",
          tabBarLabel: "CHAT",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="scoreboard"
        options={{
          title: "Arbitrage",
          tabBarLabel: "LIVE",
          tabBarIcon: ({ color, size }) => <Ionicons name="play-circle" size={24} color={color} />,
        }}
      />

      {/* 4. PARAMÈTRES (En dernier) */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Mon Compte",
          tabBarLabel: "RÉGLAGES",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={24} color={color} />,
        }}
      />

      {/* Pages Cachées */}
      <Tabs.Screen name="add-player" options={{ href: null }} />
      <Tabs.Screen name="match" options={{ href: null }} /> 
    </Tabs>
  );
}