import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';

const API_URL = "http://192.168.213.71:8000";
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function PlayerProfile() {
  const { id } = useLocalSearchParams(); 
  
  const [dataGraph, setDataGraph] = useState<number[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/joueur/${id}/historique`);
      const json = await response.json();
      
      // json contient maintenant { stats: {...}, courbe: [...] }
      setStats(json.stats);
      
      const points = json.courbe.map((h: any) => h.points);
      setDataGraph(points);
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "Analyse Joueur", headerBackTitle: "Retour" }} />

      {loading ? (
        <ActivityIndicator size="large" color="#2c3e50" style={{marginTop: 50}} />
      ) : (
        <>
            {/* 1. GRILLE DE STATS (MONEYBALL) */}
            <View style={styles.gridContainer}>
                
                {/* Ratio Victoire */}
                <View style={[styles.statBox, { backgroundColor: '#e8f8f5' }]}>
                    <Text style={styles.statLabel}>Victoires</Text>
                    <Text style={[styles.statValue, { color: '#27ae60' }]}>
                        {stats?.ratio}%
                    </Text>
                </View>

                {/* Total Matchs */}
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Matchs</Text>
                    <Text style={styles.statValue}>{stats?.total_matchs}</Text>
                </View>

                {/* Meilleure Perf */}
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Best Perf</Text>
                    <Text style={[styles.statValue, { color: '#2980b9' }]}>
                        +{stats?.best_perf}
                    </Text>
                </View>

                {/* Pire Contre */}
                <View style={[styles.statBox, { backgroundColor: '#fdedec' }]}>
                    <Text style={styles.statLabel}>Pire Contre</Text>
                    <Text style={[styles.statValue, { color: '#c0392b' }]}>
                        -{stats?.worst_contre}
                    </Text>
                </View>
            </View>


            {/* 2. GRAPHIQUE */}
            <Text style={styles.sectionTitle}>Progression</Text>
            {dataGraph.length > 0 ? (
                <View style={styles.chartContainer}>
                    <LineChart
                        data={{
                            labels: [], 
                            datasets: [{ data: dataGraph }]
                        }}
                        width={SCREEN_WIDTH - 40}
                        height={220}
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: "#fff",
                            backgroundGradientFrom: "#fff",
                            backgroundGradientTo: "#fff",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(127, 140, 141, ${opacity})`,
                            propsForDots: { r: "3", strokeWidth: "1", stroke: "#2c3e50" }
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                </View>
            ) : (
                <Text style={styles.info}>Pas assez de données pour le graphique.</Text>
            )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#f5f6fa', minHeight: '100%' },
  
  // Styles de la grille
  gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 20,
  },
  statBox: {
      width: '48%', // Pour avoir 2 carrés par ligne
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2, // Ombre Android
      shadowColor: "#000", // Ombre iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
  },
  statLabel: {
      fontSize: 14,
      color: '#7f8c8d',
      fontWeight: '600',
      marginBottom: 5,
  },
  statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2c3e50',
  },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10, marginTop: 10, marginLeft: 5 },
  chartContainer: { alignItems: 'center', backgroundColor: 'white', padding: 5, borderRadius: 15, elevation: 2 },
  info: { textAlign: 'center', color: 'gray', marginTop: 20 },
});