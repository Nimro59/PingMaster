import React, { useState, useCallback } from "react";
import { Text, View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

const API_URL = "http://192.168.213.71:8000"; 

interface Joueur {
  id: number;
  nom: string;
  prenom: string;
  points: number;
}

export default function EquipeScreen() {
  const router = useRouter(); // <--- Important pour la navigation
  const [joueurs, setJoueurs] = useState<Joueur[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchJoueurs();
    }, [])
  );

  const fetchJoueurs = async () => {
    try {
      const response = await fetch(`${API_URL}/joueurs`);
      const data = await response.json();
      const tries = data.sort((a: Joueur, b: Joueur) => b.points - a.points);
      setJoueurs(tries);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderJoueur = ({ item, index }: { item: Joueur, index: number }) => (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push(`/details/${item.id}`)} // <--- CORRECTION DU LIEN
        activeOpacity={0.7}
    >
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.nom}>{item.nom.toUpperCase()} {item.prenom}</Text>
        {/* J'ai supprimé la ligne du club ici */}
      </View>
      
      <View style={styles.pointsBadge}>
        <Text style={styles.points}>{Math.round(item.points)}</Text>
        <Text style={styles.ptsLabel}>pts</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2c3e50" style={{marginTop: 50}} />
      ) : (
        <FlatList
            data={joueurs}
            renderItem={renderJoueur}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{padding: 15, paddingBottom: 100}} // Espace pour scroller jusqu'en bas
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchJoueurs();}} />}
            ListHeaderComponent={<Text style={styles.headerTitle}>Effectif Saison 2025-2026</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7" },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15, marginLeft: 5 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 12, elevation: 2 },
  rankBadge: { width: 30, height: 30, backgroundColor: '#34495e', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  rankText: { color: 'white', fontWeight: 'bold' },
  info: { flex: 1 },
  nom: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  pointsBadge: { alignItems: 'flex-end' },
  points: { fontSize: 18, fontWeight: 'bold', color: '#e74c3c' },
  ptsLabel: { fontSize: 10, color: 'gray' }
});