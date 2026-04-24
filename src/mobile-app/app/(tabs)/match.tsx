import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Autocomplete from '../components/Autocomplete'; // <--- Import du composant

const API_URL = "http://192.168.213.71:8000";

interface Joueur {
  id: number;
  nom: string;
  prenom: string;
  points: number;
}

export default function MatchScreen() {
  const [joueurs, setJoueurs] = useState<Joueur[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [idGagnant, setIdGagnant] = useState<number | null>(null);
  const [idPerdant, setIdPerdant] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  
  // Cette variable sert juste à dire aux champs de se vider
  const [resetKey, setResetKey] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchJoueurs();
    }, [])
  );

  const fetchJoueurs = async () => {
    try {
      const response = await fetch(`${API_URL}/joueurs`);
      const data = await response.json();
      // On trie
      const triés = data.sort((a: Joueur, b: Joueur) => a.nom.localeCompare(b.nom));
      setJoueurs(triés);
      setLoadingData(false);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger la liste des joueurs.");
      setLoadingData(false);
    }
  };

  const validerMatch = async () => {
    if (!idGagnant || !idPerdant) {
      Alert.alert("Incomplet", "Sélectionne les deux joueurs dans la liste.");
      return;
    }
    if (idGagnant === idPerdant) {
      Alert.alert("Erreur", "Un joueur ne peut pas jouer contre lui-même.");
      return;
    }

    setSending(true);

    const gagnant = joueurs.find(j => j.id === idGagnant);
    const perdant = joueurs.find(j => j.id === idPerdant);

    if (!gagnant || !perdant) return;

    try {
      const donneesMatch = {
        nom_gagnant: gagnant.nom,
        prenom_gagnant: gagnant.prenom,
        nom_perdant: perdant.nom,
        prenom_perdant: perdant.prenom
      };

      const response = await fetch(`${API_URL}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donneesMatch),
      });

      const resultat = await response.json();

      if (response.ok) {
        Alert.alert(
          "Match Validé ! ✅", 
          `Points échangés : ${resultat.details.points_echanges}`,
          [{ 
            text: "Nouveau match", 
            onPress: () => { 
               // 1. On vide les sélections
               setIdGagnant(null); 
               setIdPerdant(null);
               // 2. On déclenche le reset visuel des champs
               setResetKey(prev => !prev);
               // 3. ICI LA SOLUTION : On recharge les données pour avoir les nouveaux points
               fetchJoueurs();
            } 
          }]
        );
      } else {
        Alert.alert("Erreur", resultat.detail);
      }
    } catch (error) {
      Alert.alert("Erreur", "Problème de connexion.");
    } finally {
      setSending(false);
    }
  };

  if (loadingData) return <ActivityIndicator size="large" color="#2c3e50" style={{marginTop: 50}} />;

  return (
    // KeyboardAvoidingView permet de remonter l'écran quand le clavier s'ouvre
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titre}>Saisir un Match</Text>

        <View style={[styles.card, styles.cardWinner]}>
          <Text style={styles.cardTitle}>🏆 Vainqueur</Text>
          {/* Notre composant Autocomplete fait maison */}
          <Autocomplete 
            data={joueurs} 
            placeholder="Rechercher le gagnant..." 
            onSelect={setIdGagnant}
            resetTrigger={resetKey}
          />
        </View>

        <View style={[styles.card, styles.cardLoser]}>
          <Text style={styles.cardTitle}>📉 Perdant</Text>
          <Autocomplete 
            data={joueurs} 
            placeholder="Rechercher le perdant..." 
            onSelect={setIdPerdant}
            resetTrigger={resetKey}
          />
        </View>

        <TouchableOpacity 
          style={[styles.bouton, (!idGagnant || !idPerdant) && styles.boutonDisabled]} 
          onPress={validerMatch}
          disabled={sending || !idGagnant || !idPerdant}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.boutonTexte}>VALIDER LE MATCH</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100 },
  titre: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50' },
  card: { padding: 15, borderRadius: 10, marginBottom: 20, backgroundColor: 'white', elevation: 3, zIndex: 10 }, 
  // zIndex est important pour que la liste passe par dessus la carte du dessous
  cardWinner: { borderLeftWidth: 5, borderLeftColor: '#27ae60', backgroundColor: '#e8f8f5', zIndex: 20 },
  cardLoser: { borderLeftWidth: 5, borderLeftColor: '#c0392b', backgroundColor: '#fdedec', zIndex: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' },
  bouton: { backgroundColor: '#2c3e50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  boutonDisabled: { backgroundColor: '#95a5a6' },
  boutonTexte: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});