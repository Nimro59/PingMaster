import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const API_URL = "http://192.168.213.71:8000"; 

export default function TournamentScreen() {
  const [modalScoreVisible, setModalScoreVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [scoreJ1, setScoreJ1] = useState("");
  const [scoreJ2, setScoreJ2] = useState("");
  const [tournois, setTournois] = useState([]);
  const [activeTournoi, setActiveTournoi] = useState<any>(null);
  
  // Données
  const [participants, setParticipants] = useState([]);
  const [poules, setPoules] = useState<any>(null); // Pour la vue "Poules"
  
  // Modals et Inputs
  const [modalCreateVisible, setModalCreateVisible] = useState(false);
  const [modalAddPlayerVisible, setModalAddPlayerVisible] = useState(false);
  const [newTournoiName, setNewTournoiName] = useState("");
  const [nbTables, setNbTables] = useState("4");
  const [inviteName, setInviteName] = useState("");
  const [invitePoints, setInvitePoints] = useState("500");
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTournois();
    }, [])
  );

  const fetchTournois = async () => {
    try {
      const res = await fetch(`${API_URL}/tournois`);
      const data = await res.json();
      setTournois(data);
    } catch(e) {}
  };

  const createTournoi = async () => {
    if (!newTournoiName) return;
    try {
        await fetch(`${API_URL}/tournois`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nom: newTournoiName, nb_tables: parseInt(nbTables) })
        });
        setModalCreateVisible(false);
        fetchTournois();
    } catch(e) {}
  };

  const openTournoi = async (t: any) => {
      setActiveTournoi(t);
      if (t.status === 'inscription') {
          fetchParticipants(t.id);
      } else if (t.status === 'poules') {
          fetchPoules(t.id);
      }
  };

  const fetchParticipants = async (id: number) => {
      const res = await fetch(`${API_URL}/tournois/${id}/participants`);
      const data = await res.json();
      setParticipants(data);
  };
  
  const fetchPoules = async (id: number, silent = false) => {
      if (!silent) setLoading(true);
      try {
          const res = await fetch(`${API_URL}/tournois/${id}/poules`);
          const data = await res.json();
          setPoules(data);
      } catch(e) {}
      if (!silent) setLoading(false);
  };

  const addParticipant = async () => {
      if (!inviteName) return;
      await fetch(`${API_URL}/tournois/inscription`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              tournoi_id: activeTournoi.id,
              nom_invite: inviteName,
              points: parseInt(invitePoints)
          })
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
              
              // On met à jour l'état local pour passer à la vue suivante
              const updatedTournoi = { ...activeTournoi, status: 'poules' };
              setActiveTournoi(updatedTournoi);
              fetchPoules(updatedTournoi.id);
          }}
      ]);
  };

 const validerScore = async () => {
      if (!selectedMatch) return;
      await fetch(`${API_URL}/tournois/match`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              match_id: selectedMatch.id,
              score1: parseInt(scoreJ1),
              score2: parseInt(scoreJ2)
          })
      });
      setModalScoreVisible(false);
      setScoreJ1(""); setScoreJ2("");
      
      // ICI LA MAGIE : On demande un rafraichissement SILENCIEUX (true)
      fetchPoules(activeTournoi.id, true); 
  };

  const openScoreModal = (match: any) => {
      setSelectedMatch(match);
      setScoreJ1(match.s1?.toString() || "0");
      setScoreJ2(match.s2?.toString() || "0");
      setModalScoreVisible(true);
  };

  // --- VUE 1 : ACCUEIL ---
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
                            <Text style={styles.cardSub}>{item.date} • {item.nb_tables} Poules</Text>
                        </View>
                        <View style={[styles.badge, {backgroundColor: item.status === 'poules' ? '#e67e22' : '#27ae60'}]}>
                            <Text style={{color:'white', fontSize:10, fontWeight:'bold'}}>{item.status.toUpperCase()}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Aucun tournoi.</Text>}
            />
            <TouchableOpacity style={styles.fab} onPress={() => setModalCreateVisible(true)}>
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            <Modal visible={modalCreateVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Nouveau Tournoi</Text>
                        <TextInput style={styles.input} placeholder="Nom" value={newTournoiName} onChangeText={setNewTournoiName} />
                        <TextInput style={styles.input} placeholder="Nombre de poules" keyboardType="numeric" value={nbTables} onChangeText={setNbTables} />
                        <TouchableOpacity style={styles.btnValid} onPress={createTournoi}><Text style={styles.txtValid}>Créer</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalCreateVisible(false)}><Text style={styles.cancel}>Annuler</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
      );
  }

  // --- VUE 2 : DÉTAIL TOURNOI ---
  return (
    <View style={styles.container}>
        {/* HEADER NAVIGATION */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => { setActiveTournoi(null); fetchTournois(); }}>
                <Ionicons name="arrow-back" size={24} color="#2c3e50" />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>{activeTournoi.nom}</Text>
                <Text style={styles.headerSub}>
                    {activeTournoi.status === 'inscription' ? 'Inscriptions en cours' : 'Phase de Poules'}
                </Text>
            </View>
            
            {/* BOUTON PLAY (GÉNÉRATION) */}
            {activeTournoi.status === 'inscription' && (
                <TouchableOpacity onPress={lancerGeneration}>
                    <Ionicons name="play-circle" size={34} color="#e74c3c" />
                </TouchableOpacity>
            )}
        </View>

        {loading ? <ActivityIndicator size="large" color="#2c3e50" /> : (
            <>
                {/* MODE INSCRIPTION */}
                {activeTournoi.status === 'inscription' && (
                    <>
                        <FlatList
                            data={participants}
                            keyExtractor={(item: any) => item.id.toString()}
                            ListHeaderComponent={<Text style={styles.sectionTitle}>{participants.length} JOUEURS INSCRITS</Text>}
                            renderItem={({item, index}) => (
                                <View style={styles.playerRow}>
                                    <Text style={styles.rank}>#{index+1}</Text>
                                    <Text style={styles.playerName}>{item.nom}</Text>
                                    <Text style={styles.playerPts}>{item.points} pts</Text>
                                </View>
                            )}
                        />
                        <TouchableOpacity style={styles.fab} onPress={() => setModalAddPlayerVisible(true)}>
                            <Ionicons name="person-add" size={24} color="white" />
                        </TouchableOpacity>
                    </>
                )}

                {/* MODE POULES (APRÈS GÉNÉRATION) */}
                {activeTournoi.status === 'poules' && poules && (
                    <ScrollView>
                        {Object.keys(poules).sort().map((lettre) => (
                            <View key={lettre} style={styles.pouleCard}>
                                <View style={styles.pouleHeader}>
                                    <Text style={styles.pouleTitle}>POULE {lettre}</Text>
                                </View>
                                
                                {/* LISTE DES JOUEURS (CLASSEMENT) */}
                                <View style={{backgroundColor:'#fdfefe', paddingBottom: 10}}>
                                    {poules[lettre].joueurs.map((joueur: any, idx: number) => (
                                        <View key={idx} style={styles.pouleRow}>
                                            <Text style={{fontWeight:'bold', width: 20, color:'#bdc3c7'}}>{idx+1}.</Text>
                                            <Text style={{flex:1, fontWeight:'600'}}>{joueur.nom}</Text>
                                            <Text style={{color:'gray', fontSize:12}}>{joueur.points}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* LISTE DES MATCHS (Groupés par Tours) */}
                                <View style={{borderTopWidth:1, borderColor:'#eee'}}>
                                    {/* On trie les matchs par numéro de tour */}
                                    {poules[lettre].matchs
                                        .sort((a:any, b:any) => parseInt(a.tour) - parseInt(b.tour))
                                        .map((m: any, index: number, array: any[]) => {
                                            // Affiche le header "Tour X" si c'est le premier du tour
                                            const showHeader = index === 0 || m.tour !== array[index-1].tour;
                                            return (
                                                <View key={m.id}>
                                                    {showHeader && (
                                                        <Text style={{fontSize:10, fontWeight:'bold', color:'#e67e22', margin:10, marginLeft:5}}>
                                                            TOUR {m.tour}
                                                        </Text>
                                                    )}
                                                    <TouchableOpacity 
                                                        style={[styles.matchRow, m.termine && {backgroundColor:'#f1f8e9'}]}
                                                        onPress={() => openScoreModal(m)}
                                                    >
                                                        <Text style={[styles.matchPlayer, m.s1 > m.s2 && m.termine && styles.winner]}>{m.j1}</Text>
                                                        <View style={styles.scoreBadge}>
                                                            {m.termine ? (
                                                                <Text style={styles.scoreText}>{m.s1} - {m.s2}</Text>
                                                            ) : (
                                                                <Text style={{fontSize:10, color:'white'}}>JOUER</Text>
                                                            )}
                                                        </View>
                                                        <Text style={[styles.matchPlayer, {textAlign:'right'}, m.s2 > m.s1 && m.termine && styles.winner]}>{m.j2}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                    })}
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity 
                        style={styles.btnCloture} 
                        onPress={() => {
                            Alert.alert("Fin des Poules", "Calculer le classement et générer le tableau final ?", [
                                {text: "Annuler"},
                                {text: "Générer Tableau", onPress: async () => {
                                    setLoading(true);
                                    await fetch(`${API_URL}/tournois/${activeTournoi.id}/cloture-poules`, {method:'POST'});
                                    // Refresh complet
                                    const res = await fetch(`${API_URL}/tournois`);
                                    const data = await res.json();
                                    const updated = data.find((t:any) => t.id === activeTournoi.id);
                                    setActiveTournoi(updated);
                                    fetchPoules(updated.id);
                                }}
                            ]);
                        }}
                    >
                        <Ionicons name="git-network" size={24} color="white" style={{marginRight:10}} />
                        <Text style={{color:'white', fontWeight:'bold', fontSize:16}}>GÉNÉRER LE TABLEAU FINAL</Text>
                    </TouchableOpacity>
                    </ScrollView>
                )}

                {/* MODE TABLEAU FINAL (ARBRE) */}
                {activeTournoi.status === 'tableau' && (
                    <ScrollView contentContainerStyle={{paddingBottom: 50}}>
                        <Text style={styles.sectionTitle}>PHASE FINALE</Text>
                        
                        {(!poules || !poules['Tableau'] || poules['Tableau'].matchs.length === 0) ? (
                            <View style={{alignItems: 'center', marginTop: 30}}>
                                <Text style={{color:'gray', textAlign:'center'}}>
                                    Aucun match de finale généré.{'\n'}Avez-vous bien saisi les scores des poules ?
                                </Text>
                            </View>
                        ) : (
                            ['1/4', '1/2', 'Finale'].map((phase) => {
                                const matchsPhase = poules['Tableau'].matchs.filter((m:any) => m.tour === phase);
                                if (matchsPhase.length === 0) return null;

                                return (
                                    <View key={phase} style={{marginBottom: 20}}>
                                        <View style={styles.phaseHeader}>
                                            <Text style={{color:'white', fontWeight:'bold'}}>{phase.toUpperCase()}</Text>
                                        </View>
                                        {matchsPhase.map((m:any) => (
                                            <TouchableOpacity 
                                                key={m.id} 
                                                style={styles.treeMatch}
                                                onPress={() => openScoreModal(m)}
                                            >
                                                <View style={[styles.treePlayerBox, m.s1 > m.s2 && m.termine && {backgroundColor:'#dcedc8'}]}>
                                                    <Text style={styles.treePlayerName}>{m.j1}</Text>
                                                    <Text style={styles.treeScore}>{m.termine ? m.s1 : '-'}</Text>
                                                </View>
                                                <View style={[styles.treePlayerBox, m.s2 > m.s1 && m.termine && {backgroundColor:'#dcedc8'}]}>
                                                    <Text style={styles.treePlayerName}>{m.j2}</Text>
                                                    <Text style={styles.treeScore}>{m.termine ? m.s2 : '-'}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )
                            })
                        )}
                    </ScrollView>
                )}
            </>
        )}

        {/* MODAL INSCRIPTION INVITE */}
        <Modal visible={modalAddPlayerVisible} transparent={true} animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Ajout Rapide</Text>
                    <TextInput style={styles.input} placeholder="Nom" value={inviteName} onChangeText={setInviteName} />
                    <TextInput style={styles.input} placeholder="Points" keyboardType="numeric" value={invitePoints} onChangeText={setInvitePoints} />
                    <TouchableOpacity style={styles.btnValid} onPress={addParticipant}><Text style={styles.txtValid}>Ajouter</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalAddPlayerVisible(false)}><Text style={styles.cancel}>Annuler</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
        {/* MODAL SCORE */}
        <Modal visible={modalScoreVisible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Résultat du Match</Text>
                    <Text style={{textAlign:'center', marginBottom:20, color:'gray'}}>
                        {selectedMatch?.j1}  vs  {selectedMatch?.j2}
                    </Text>
                    
                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', marginBottom:20}}>
                        <TextInput 
                            style={styles.scoreInput} 
                            keyboardType="numeric" 
                            value={scoreJ1} 
                            onChangeText={setScoreJ1}
                            maxLength={1}
                        />
                        <Text style={{fontSize:20, marginHorizontal:10}}>-</Text>
                        <TextInput 
                            style={styles.scoreInput} 
                            keyboardType="numeric" 
                            value={scoreJ2} 
                            onChangeText={setScoreJ2}
                            maxLength={1}
                        />
                    </View>

                    <TouchableOpacity style={styles.btnValid} onPress={validerScore}>
                        <Text style={styles.txtValid}>Valider le Score</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalScoreVisible(false)}>
                        <Text style={styles.cancel}>Annuler</Text>
                    </TouchableOpacity>
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

  // Styles Poules
  pouleCard: { backgroundColor: 'white', borderRadius: 10, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  pouleHeader: { backgroundColor: '#34495e', padding: 10 },
  pouleTitle: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  pouleRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  matchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  matchPlayer: { flex: 1, fontSize: 13, color: '#34495e' },
  winner: { fontWeight: 'bold', color: '#27ae60' },
  scoreBadge: { backgroundColor: '#3498db', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, minWidth: 50, alignItems: 'center' },
  scoreText: { color: 'white', fontWeight: 'bold' },
  
  btnCloture: { backgroundColor: '#2c3e50', margin: 15, padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  
  // Styles Arbre
  phaseHeader: { backgroundColor: '#34495e', padding: 8, borderRadius: 5, alignSelf: 'center', marginBottom: 10, paddingHorizontal: 20 },
  treeMatch: { backgroundColor: 'white', borderRadius: 8, marginBottom: 10, elevation: 2, overflow: 'hidden', marginHorizontal: 10 },
  treePlayerBox: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  treePlayerName: { fontWeight: 'bold', color: '#2c3e50' },
  treeScore: { fontWeight: 'bold', color: '#e74c3c' },

  // Styles Input Score
  scoreInput: { backgroundColor: '#f1f2f6', width: 60, height: 60, borderRadius: 10, textAlign: 'center', fontSize: 24, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalView: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign:'center' },
  input: { backgroundColor: '#f1f2f6', padding: 12, borderRadius: 8, marginBottom: 15 },
  btnValid: { backgroundColor: '#27ae60', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  txtValid: { color: 'white', fontWeight: 'bold' },
  cancel: { textAlign: 'center', color: 'gray' },
});