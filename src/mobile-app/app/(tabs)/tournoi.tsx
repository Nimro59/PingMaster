import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const API_URL = "http://192.168.1.18:8000"; // Remplacer par ton IP

export default function TournamentScreen() {
  const [tournois, setTournois] = useState([]);
  const [activeTournoi, setActiveTournoi] = useState<any>(null);
  const [participants, setParticipants] = useState([]);
  const [poules, setPoules] = useState<any>(null);
  
  const [modalCreateVisible, setModalCreateVisible] = useState(false);
  const [modalAddPlayerVisible, setModalAddPlayerVisible] = useState(false);
  const [modalScoreVisible, setModalScoreVisible] = useState(false);
  
  const [newTournoiName, setNewTournoiName] = useState("");
  const [nbTables, setNbTables] = useState("4");
  const [inviteName, setInviteName] = useState("");
  const [invitePoints, setInvitePoints] = useState("500");
  const [loading, setLoading] = useState(false);
  
  // Correction du '0' : On initialise en chaîne vide
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [scoreJ1, setScoreJ1] = useState("");
  const [scoreJ2, setScoreJ2] = useState("");

  useFocusEffect(useCallback(() => { fetchTournois(); }, []));

  const fetchTournois = async () => {
    try {
      const res = await fetch(`${API_URL}/tournois`);
      setTournois(await res.json());
    } catch(e) {}
  };

  const createTournoi = async () => {
    if (!newTournoiName) return;
    await fetch(`${API_URL}/tournois`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nom: newTournoiName, nb_tables: parseInt(nbTables) })
    });
    setModalCreateVisible(false);
    fetchTournois();
  };

  const openTournoi = async (t: any) => {
      setActiveTournoi(t);
      if (t.status === 'inscription') fetchParticipants(t.id);
      else fetchPoules(t.id);
  };

  const fetchParticipants = async (id: number) => {
      const res = await fetch(`${API_URL}/tournois/${id}/participants`);
      setParticipants(await res.json());
  };
  
  const fetchPoules = async (id: number, silent = false) => {
      if (!silent) setLoading(true);
      try {
          const res = await fetch(`${API_URL}/tournois/${id}/poules`);
          setPoules(await res.json());
      } catch(e) {}
      if (!silent) setLoading(false);
  };

  const addParticipant = async () => {
      if (!inviteName) return;
      await fetch(`${API_URL}/tournois/inscription`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ tournoi_id: activeTournoi.id, nom_invite: inviteName, points: parseInt(invitePoints) })
      });
      setModalAddPlayerVisible(false);
      setInviteName("");
      fetchParticipants(activeTournoi.id);
  };

  const lancerGeneration = async () => {
      Alert.alert("Lancement", "Verrouiller les inscriptions et générer les poules ?", [
          { text: "Annuler" },
          { text: "Générer", onPress: async () => {
              setLoading(true);
              await fetch(`${API_URL}/tournois/${activeTournoi.id}/generation`, { method: 'POST' });
              const updatedTournoi = { ...activeTournoi, status: 'poules' };
              setActiveTournoi(updatedTournoi);
              fetchPoules(updatedTournoi.id);
          }}
      ]);
  };

  const cloturerPoules = async () => {
      Alert.alert("Fin des Poules", "Générer l'arbre final ?", [
          { text: "Annuler" },
          { text: "Générer Tableau", onPress: async () => {
              setLoading(true);
              await fetch(`${API_URL}/tournois/${activeTournoi.id}/cloture-poules`, {method:'POST'});
              const updatedTournoi = { ...activeTournoi, status: 'tableau' };
              setActiveTournoi(updatedTournoi);
              fetchPoules(updatedTournoi.id);
          }}
      ]);
  };

  const openScoreModal = (match: any) => {
      if (match.j1 === "Exempté" || match.j2 === "Exempté") return; // On ne joue pas contre un fantôme
      setSelectedMatch(match);
      setScoreJ1(match.s1 > 0 ? match.s1.toString() : "");
      setScoreJ2(match.s2 > 0 ? match.s2.toString() : "");
      setModalScoreVisible(true);
  };

  const validerScore = async () => {
      if (!selectedMatch || !scoreJ1 || !scoreJ2) return;
      await fetch(`${API_URL}/tournois/match`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ match_id: selectedMatch.id, score1: parseInt(scoreJ1), score2: parseInt(scoreJ2) })
      });
      setModalScoreVisible(false);
      fetchPoules(activeTournoi.id, true);
  };

  if (!activeTournoi) {
      return (
        <View style={styles.container}>
            <Text style={styles.titre}>Tournois du Club</Text>
            <FlatList
                data={tournois}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.card} onPress={() => openTournoi(item)}>
                        <View>
                            <Text style={styles.cardTitle}>{item.nom}</Text>
                            <Text style={styles.cardSub}>{item.date} • {item.nb_tables} Tables</Text>
                        </View>
                        <View style={[styles.badge, {backgroundColor: item.status === 'poules' ? '#e67e22' : '#27ae60'}]}>
                            <Text style={{color:'white', fontSize:10, fontWeight:'bold'}}>{item.status.toUpperCase()}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Aucun tournoi.</Text>}
            />
            <TouchableOpacity style={styles.fab} onPress={() => setModalCreateVisible(true)}><Ionicons name="add" size={30} color="white" /></TouchableOpacity>

            <Modal visible={modalCreateVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Nouveau Tournoi</Text>
                        <TextInput style={styles.input} placeholder="Nom" value={newTournoiName} onChangeText={setNewTournoiName} />
                        <TextInput style={styles.input} placeholder="Nombre de tables" keyboardType="numeric" value={nbTables} onChangeText={setNbTables} />
                        <TouchableOpacity style={styles.btnValid} onPress={createTournoi}><Text style={styles.txtValid}>Créer</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalCreateVisible(false)}><Text style={styles.cancel}>Annuler</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
      );
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => { setActiveTournoi(null); fetchTournois(); }}>
                <Ionicons name="arrow-back" size={24} color="#2c3e50" />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>{activeTournoi.nom}</Text>
                <Text style={styles.headerSub}>{activeTournoi.status.toUpperCase()}</Text>
            </View>
            {activeTournoi.status === 'inscription' && (
                <TouchableOpacity onPress={lancerGeneration}><Ionicons name="play-circle" size={34} color="#e74c3c" /></TouchableOpacity>
            )}
        </View>

        {loading ? <ActivityIndicator size="large" color="#2c3e50" /> : (
            <>
                {activeTournoi.status === 'inscription' && (
                    <>
                        <FlatList
                            data={participants}
                            keyExtractor={(item: any) => item.id.toString()}
                            ListHeaderComponent={<Text style={styles.sectionTitle}>{participants.length} INSCRITS</Text>}
                            renderItem={({item, index}) => (
                                <View style={styles.playerRow}>
                                    <Text style={styles.rank}>#{index+1}</Text>
                                    <Text style={styles.playerName}>{item.nom}</Text>
                                    <Text style={styles.playerPts}>{item.points} pts</Text>
                                </View>
                            )}
                        />
                        <TouchableOpacity style={styles.fab} onPress={() => setModalAddPlayerVisible(true)}><Ionicons name="person-add" size={24} color="white" /></TouchableOpacity>
                    </>
                )}

                {activeTournoi.status === 'poules' && poules && (
                    <ScrollView>
                        {Object.keys(poules).filter(k => k !== 'Tableau').sort().map((lettre) => (
                            <View key={lettre} style={styles.pouleCard}>
                                <View style={styles.pouleHeader}><Text style={styles.pouleTitle}>POULE {lettre}</Text></View>
                                <View style={{backgroundColor:'#fdfefe', paddingBottom: 10}}>
                                    {poules[lettre].joueurs.map((joueur: any, idx: number) => (
                                        <View key={idx} style={styles.pouleRow}>
                                            <Text style={{fontWeight:'bold', width: 20, color:'#bdc3c7'}}>{idx+1}.</Text>
                                            <Text style={{flex:1, fontWeight:'600'}}>{joueur.nom}</Text>
                                        </View>
                                    ))}
                                </View>
                                <View style={{borderTopWidth:1, borderColor:'#eee'}}>
                                    {poules[lettre].matchs.sort((a:any, b:any) => parseInt(a.tour) - parseInt(b.tour)).map((m: any, idx: number, arr: any[]) => {
                                        const showTour = idx === 0 || m.tour !== arr[idx-1].tour;
                                        return (
                                            <View key={m.id}>
                                                {showTour && <Text style={styles.tourLabel}>TOUR {m.tour}</Text>}
                                                <TouchableOpacity style={[styles.matchRow, m.termine && {backgroundColor:'#f1f8e9'}]} onPress={() => openScoreModal(m)}>
                                                    <Text style={[styles.matchPlayer, m.s1 > m.s2 && m.termine && styles.winner]}>{m.j1}</Text>
                                                    <View style={styles.scoreBadge}>
                                                        {m.termine ? <Text style={styles.scoreText}>{m.s1} - {m.s2}</Text> : <Text style={{fontSize:10, color:'white'}}>JOUER</Text>}
                                                    </View>
                                                    <Text style={[styles.matchPlayer, {textAlign:'right'}, m.s2 > m.s1 && m.termine && styles.winner]}>{m.j2}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.btnCloture} onPress={cloturerPoules}>
                            <Text style={{color:'white', fontWeight:'bold'}}>GÉNÉRER LE TABLEAU FINAL</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}

                {activeTournoi.status === 'tableau' && (
                    <ScrollView contentContainerStyle={{paddingBottom: 50}}>
                        {(!poules || !poules['Tableau']) ? (
                            <ActivityIndicator color="#e74c3c" style={{marginTop: 50}} />
                        ) : (
                            <>
                                <Text style={styles.sectionTitle}>PHASE FINALE</Text>
                                {['1/8', '1/4', '1/2', 'Finale'].map((phase) => {
                                    const matchsPhase = poules['Tableau'].matchs.filter((m:any) => m.tour === phase);
                                    if (matchsPhase.length === 0) return null;
                                    return (
                                        <View key={phase} style={{marginBottom: 20}}>
                                            <View style={styles.phaseHeader}><Text style={{color:'white', fontWeight:'bold'}}>{phase.toUpperCase()}</Text></View>
                                            {matchsPhase.map((m:any) => (
                                                <TouchableOpacity key={m.id} style={styles.treeMatch} onPress={() => openScoreModal(m)}>
                                                    <View style={[styles.treePlayerBox, m.s1 > m.s2 && m.termine && {backgroundColor:'#dcedc8'}]}>
                                                        <Text style={styles.treePlayerName}>{m.j1}</Text>
                                                        <Text style={styles.treeScore}>{m.termine ? m.s1 : (m.j2 === 'Exempté' ? 'V' : '-')}</Text>
                                                    </View>
                                                    <View style={[styles.treePlayerBox, m.s2 > m.s1 && m.termine && {backgroundColor:'#dcedc8'}]}>
                                                        <Text style={styles.treePlayerName}>{m.j2}</Text>
                                                        <Text style={styles.treeScore}>{m.termine ? m.s2 : (m.j1 === 'Exempté' ? 'V' : '-')}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )
                                })}
                            </>
                        )}
                    </ScrollView>
                )}
            </>
        )}

        <Modal visible={modalAddPlayerVisible} transparent={true} animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Ajout Manuel</Text>
                    <TextInput style={styles.input} placeholder="Nom" value={inviteName} onChangeText={setInviteName} />
                    <TextInput style={styles.input} placeholder="Points" keyboardType="numeric" value={invitePoints} onChangeText={setInvitePoints} />
                    <TouchableOpacity style={styles.btnValid} onPress={addParticipant}><Text style={styles.txtValid}>Ajouter</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalAddPlayerVisible(false)}><Text style={styles.cancel}>Annuler</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>

        <Modal visible={modalScoreVisible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Résultat du Match</Text>
                    <Text style={{textAlign:'center', marginBottom:20, color:'gray'}}>{selectedMatch?.j1} vs {selectedMatch?.j2}</Text>
                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', marginBottom:20}}>
                        <TextInput style={styles.scoreInput} keyboardType="numeric" value={scoreJ1} onChangeText={setScoreJ1} placeholder="0" maxLength={1}/>
                        <Text style={{fontSize:20, marginHorizontal:10}}>-</Text>
                        <TextInput style={styles.scoreInput} keyboardType="numeric" value={scoreJ2} onChangeText={setScoreJ2} placeholder="0" maxLength={1}/>
                    </View>
                    <TouchableOpacity style={styles.btnValid} onPress={validerScore}><Text style={styles.txtValid}>Valider le Score</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalScoreVisible(false)}><Text style={styles.cancel}>Annuler</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7", padding: 15 },
  titre: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#2c3e50' },
  cardSub: { color: 'gray', fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  empty: { textAlign: 'center', color: 'gray', marginTop: 50 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#2c3e50', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, backgroundColor: 'white', padding: 15, borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  headerSub: { fontSize: 12, color: 'gray' },
  sectionTitle: { fontWeight: 'bold', color: '#7f8c8d', marginBottom: 10 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, marginBottom: 5, borderRadius: 8 },
  rank: { width: 30, fontWeight: 'bold', color: '#bdc3c7' },
  playerName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  playerPts: { fontWeight: 'bold', color: '#3498db' },
  pouleCard: { backgroundColor: 'white', borderRadius: 10, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  pouleHeader: { backgroundColor: '#34495e', padding: 10 },
  pouleTitle: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  pouleRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  tourLabel: { fontSize:10, fontWeight:'bold', color:'#e67e22', margin:10, marginLeft:5 },
  matchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  matchPlayer: { flex: 1, fontSize: 13, color: '#34495e' },
  winner: { fontWeight: 'bold', color: '#27ae60' },
  scoreBadge: { backgroundColor: '#3498db', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, minWidth: 50, alignItems: 'center' },
  scoreText: { color: 'white', fontWeight: 'bold' },
  btnCloture: { backgroundColor: '#2c3e50', margin: 15, padding: 15, borderRadius: 10, alignItems: 'center', elevation: 3 },
  phaseHeader: { backgroundColor: '#34495e', padding: 8, borderRadius: 5, alignSelf: 'center', marginBottom: 10, paddingHorizontal: 20 },
  treeMatch: { backgroundColor: 'white', borderRadius: 8, marginBottom: 10, elevation: 2, overflow: 'hidden', marginHorizontal: 10 },
  treePlayerBox: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  treePlayerName: { fontWeight: 'bold', color: '#2c3e50' },
  treeScore: { fontWeight: 'bold', color: '#e74c3c' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalView: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign:'center' },
  input: { backgroundColor: '#f1f2f6', padding: 12, borderRadius: 8, marginBottom: 15 },
  btnValid: { backgroundColor: '#27ae60', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  txtValid: { color: 'white', fontWeight: 'bold' },
  cancel: { textAlign: 'center', color: 'gray' },
  scoreInput: { backgroundColor: '#f1f2f6', width: 60, height: 60, borderRadius: 10, textAlign: 'center', fontSize: 24, fontWeight: 'bold' }
});