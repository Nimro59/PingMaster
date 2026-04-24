import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const API_URL = "http://192.168.213.71:8000"; 

export default function LiveHubScreen() {
  const [livesClub, setLivesClub] = useState([]);
  const [livesWTT, setLivesWTT] = useState([]);
  
  // États pour l'Arbitrage (Mode Diffusion)
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [j1, setJ1] = useState("");
  const [j2, setJ2] = useState("");
  const [matchId, setMatchId] = useState("");
  
  // Score actuel (Si je suis arbitre)
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [set1, setSet1] = useState(0);
  const [set2, setSet2] = useState(0);
  const [service, setService] = useState(1);

  // Modal de démarrage
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Si je n'arbitre pas, je rafraichis la liste des lives
      if (!isArbitrating) {
          const interval = setInterval(fetchLives, 3000); // Mise à jour toutes les 3s
          fetchLives();
          return () => clearInterval(interval);
      }
    }, [isArbitrating])
  );

  const fetchLives = async () => {
    try {
      const response = await fetch(`${API_URL}/lives`);
      const data = await response.json();
      setLivesClub(data.club);
      setLivesWTT(data.wtt);
    } catch (e) {}
  };

  // --- LOGIQUE ARBITRE ---
  const demarrerLive = () => {
      if (!j1 || !j2) return;
      const newId = Date.now().toString(); // ID unique temporaire
      setMatchId(newId);
      setIsArbitrating(true);
      setModalVisible(false);
      // Init serveur
      updateServer(newId, 0, 0, 0, 0, 1);
  };

  const updateServer = async (id: string, s1: number, s2: number, st1: number, st2: number, srv: number) => {
      try {
        await fetch(`${API_URL}/lives/update`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                match_id: id, joueur1: j1, joueur2: j2,
                score1: s1, score2: s2, set1: st1, set2: st2, service: srv
            })
        });
      } catch(e) {}
  };

  const point = (joueur: number, delta: number) => {
      let ns1 = score1, ns2 = score2;
      if (joueur === 1) { ns1 = Math.max(0, score1 + delta); setScore1(ns1); }
      else { ns2 = Math.max(0, score2 + delta); setScore2(ns2); }
      
      // Service auto simple
      let nSrv = service;
      if (((ns1 + ns2) % 2) === 0 && (ns1+ns2) !== 0 && delta > 0) nSrv = service === 1 ? 2 : 1;
      setService(nSrv);

      updateServer(matchId, ns1, ns2, set1, set2, nSrv);
  };

  const updateSet = (joueur: number) => {
      let nst1 = set1, nst2 = set2;
      if (joueur === 1) nst1++; else nst2++;
      setSet1(nst1); setSet2(nst2);
      setScore1(0); setScore2(0); // Nouveau set = 0-0
      updateServer(matchId, 0, 0, nst1, nst2, service);
  };

  const arreterLive = async () => {
      Alert.alert("Fin du match", "Arrêter la diffusion ?", [
          { text: "Non" },
          { text: "Oui, Arrêter", onPress: async () => {
              await fetch(`${API_URL}/lives/${matchId}`, { method: 'DELETE' });
              setIsArbitrating(false);
              setScore1(0); setScore2(0); setSet1(0); setSet2(0);
          }}
      ]);
  };

  // --- VUE ARBITRE (TÉLÉCOMMANDE) ---
  if (isArbitrating) {
      return (
        <View style={styles.arbitreContainer}>
            <Text style={styles.liveIndicator}>🔴 EN DIRECT</Text>
            <View style={styles.scoreBoard}>
                <View style={styles.col}>
                    <Text style={styles.pName}>{j1}</Text>
                    <Text style={styles.bigScore}>{score1}</Text>
                    <Text style={styles.sets}>Set: {set1}</Text>
                    <TouchableOpacity style={styles.btnSet} onPress={() => updateSet(1)}><Text style={{color:'white'}}>+ Set</Text></TouchableOpacity>
                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.btnMoins} onPress={() => point(1, -1)}><Ionicons name="remove" size={24} color="white"/></TouchableOpacity>
                        <TouchableOpacity style={styles.btnPlus} onPress={() => point(1, 1)}><Ionicons name="add" size={32} color="white"/></TouchableOpacity>
                    </View>
                </View>
                
                <View style={{justifyContent:'center', alignItems:'center'}}>
                    <View style={[styles.dot, {backgroundColor: service===1 ? '#f1c40f':'transparent'}]}/>
                    <Text style={{color:'gray', fontWeight:'bold'}}>VS</Text>
                    <View style={[styles.dot, {backgroundColor: service===2 ? '#f1c40f':'transparent'}]}/>
                </View>

                <View style={styles.col}>
                    <Text style={styles.pName}>{j2}</Text>
                    <Text style={styles.bigScore}>{score2}</Text>
                    <Text style={styles.sets}>Set: {set2}</Text>
                    <TouchableOpacity style={styles.btnSet} onPress={() => updateSet(2)}><Text style={{color:'white'}}>+ Set</Text></TouchableOpacity>
                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.btnMoins} onPress={() => point(2, -1)}><Ionicons name="remove" size={24} color="white"/></TouchableOpacity>
                        <TouchableOpacity style={styles.btnPlus} onPress={() => point(2, 1)}><Ionicons name="add" size={32} color="white"/></TouchableOpacity>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.stopBtn} onPress={arreterLive}><Text style={styles.stopText}>ARRÊTER LA DIFFUSION</Text></TouchableOpacity>
        </View>
      );
  }

  // --- VUE SPECTATEUR (LISTE) ---
  return (
    <ScrollView style={styles.container}>
      
      {/* SECTION WTT (GRANDS ÉVÉNEMENTS) */}
      <View style={styles.sectionHeader}>
        <Ionicons name="globe" size={20} color="#e74c3c" />
        <Text style={styles.sectionTitle}>INTERNATIONAL (WTT)</Text>
      </View>
      
      {livesWTT.map((match: any) => (
        <View key={match.id} style={styles.cardWTT}>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={styles.wttPlayer}>{match.joueur1}</Text>
                <Text style={styles.wttScore}>{match.score}</Text>
                <Text style={styles.wttPlayer}>{match.joueur2}</Text>
            </View>
            <Text style={styles.wttStatus}>{match.statut}</Text>
        </View>
      ))}

      {/* SECTION CLUB (LOCAUX) */}
      <View style={styles.sectionHeader}>
        <Ionicons name="radio" size={20} color="#27ae60" />
        <Text style={styles.sectionTitle}>LIVES DU CLUB</Text>
      </View>

      {livesClub.length === 0 ? (
          <Text style={styles.empty}>Aucun match diffusé actuellement.</Text>
      ) : (
          livesClub.map((match: any) => (
            <View key={match.match_id} style={styles.cardLive}>
                <View style={styles.liveBadge}><Text style={{color:'white', fontSize:10, fontWeight:'bold'}}>LIVE</Text></View>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop: 10}}>
                    <View style={{alignItems:'center', flex:1}}>
                        <Text style={styles.livePlayer}>{match.joueur1}</Text>
                        <Text style={styles.liveSet}>({match.set1})</Text>
                    </View>
                    <Text style={styles.liveBigScore}>{match.score1} - {match.score2}</Text>
                    <View style={{alignItems:'center', flex:1}}>
                        <Text style={styles.livePlayer}>{match.joueur2}</Text>
                        <Text style={styles.liveSet}>({match.set2})</Text>
                    </View>
                </View>
            </View>
          ))
      )}

      {/* BOUTON DIFFUSER */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="videocam" size={24} color="white" />
          <Text style={{color:'white', fontWeight:'bold', marginLeft:5}}>Diffuser</Text>
      </TouchableOpacity>

      {/* MODAL CONFIGURATION */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                  <Text style={styles.modalTitle}>Lancer un Live</Text>
                  <TextInput style={styles.input} placeholder="Joueur 1 (ex: Moi)" value={j1} onChangeText={setJ1}/>
                  <TextInput style={styles.input} placeholder="Joueur 2 (ex: L'autre)" value={j2} onChangeText={setJ2}/>
                  <View style={{flexDirection:'row', justifyContent:'space-between', marginTop: 20}}>
                      <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{color:'gray'}}>Annuler</Text></TouchableOpacity>
                      <TouchableOpacity onPress={demarrerLive} style={styles.btnGo}><Text style={{color:'white', fontWeight:'bold'}}>C'est parti !</Text></TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7", padding: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontWeight: 'bold', color: '#7f8c8d', marginLeft: 10 },
  
  // Styles WTT
  cardWTT: { backgroundColor: '#2c3e50', padding: 15, borderRadius: 10, marginBottom: 10 },
  wttPlayer: { color: 'white', fontWeight: 'bold' },
  wttScore: { color: '#f1c40f', fontWeight: 'bold', fontSize: 18 },
  wttStatus: { color: '#bdc3c7', fontSize: 10, textAlign: 'center', marginTop: 5 },

  // Styles Live Club
  cardLive: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 3 },
  liveBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: 'red', paddingHorizontal: 8, paddingVertical: 2, borderBottomLeftRadius: 10, borderTopRightRadius: 15 },
  livePlayer: { fontWeight: 'bold', fontSize: 16, color: '#2c3e50' },
  liveSet: { color: 'gray', fontSize: 12 },
  liveBigScore: { fontSize: 32, fontWeight: 'bold', color: '#e74c3c' },
  empty: { textAlign: 'center', color: 'gray', marginTop: 10, fontStyle: 'italic' },

  // FAB
  fab: { position: 'absolute', bottom: 20, right: 0, alignSelf:'center', backgroundColor: '#e74c3c', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, flexDirection:'row', alignItems:'center', elevation: 5 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalView: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign:'center' },
  input: { backgroundColor: '#f1f2f6', padding: 10, borderRadius: 8, marginBottom: 10 },
  btnGo: { backgroundColor: '#27ae60', padding: 10, borderRadius: 8 },

  // Arbitre Mode
  arbitreContainer: { flex: 1, backgroundColor: '#2c3e50', padding: 20, alignItems: 'center', justifyContent: 'center' },
  liveIndicator: { color: 'red', fontWeight: 'bold', marginBottom: 20, backgroundColor:'rgba(255,0,0,0.2)', padding:5, borderRadius:5 },
  scoreBoard: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  col: { alignItems: 'center', flex: 1 },
  pName: { color: '#bdc3c7', fontSize: 18, marginBottom: 5 },
  bigScore: { color: 'white', fontSize: 70, fontWeight: 'bold' },
  sets: { color: '#f1c40f', fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
  btnSet: { backgroundColor: '#34495e', padding: 5, borderRadius: 5, marginBottom: 15 },
  controls: { flexDirection: 'row', gap: 10 },
  btnPlus: { backgroundColor: '#27ae60', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnMoins: { backgroundColor: '#c0392b', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, marginVertical: 5 },
  stopBtn: { backgroundColor: '#c0392b', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
  stopText: { color: 'white', fontWeight: 'bold' }
});