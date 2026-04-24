import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://192.168.213.71:8000"; 

export default function StatsAssiduiteScreen() {
  const [stats, setStats] = useState([]);
  const [joueurs, setJoueurs] = useState([]);
  
  // Identité et Droits
  const [myId, setMyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dejaBadge, setDejaBadge] = useState(false);

  // Modals
  const [modalIdentityVisible, setModalIdentityVisible] = useState(false);
  const [modalAppelVisible, setModalAppelVisible] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];

  useFocusEffect(
    useCallback(() => {
      chargerProfil();
      fetchStats();
      fetchJoueurs();
    }, [])
  );

  const chargerProfil = async () => {
    // 1. Est-ce qu'on sait qui utilise l'appli ?
    const storedId = await AsyncStorage.getItem('monJoueurId');
    setMyId(storedId);

    // 2. Est-ce que c'est le coach ?
    const adminStatus = await AsyncStorage.getItem('isAdmin');
    setIsAdmin(adminStatus === 'true');

    // 3. A-t-il déjà badgé aujourd'hui ? (On vérifie dans la liste des présences plus tard)
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats/assiduite`);
      const data = await res.json();
      setStats(data);
    } catch(e) {}
  };

  const fetchJoueurs = async () => {
    try {
      const res = await fetch(`${API_URL}/joueurs`);
      const data = await res.json();
      // Tri alphabétique pour faciliter la recherche
      setJoueurs(data.sort((a:any, b:any) => a.nom.localeCompare(b.nom)));
    } catch(e) {}
  };

  // --- ACTION : LE JOUEUR BADGE LUI-MÊME ---
  const badgerPresence = async () => {
    if (!myId) {
        // Si on ne sait pas qui c'est, on demande
        setModalIdentityVisible(true);
        return;
    }

    try {
        await fetch(`${API_URL}/presences`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ joueur_id: parseInt(myId), date: today, statut: 'present' })
        });
        setDejaBadge(true);
        Alert.alert("Présence validée ✅", "Bon entraînement !");
        fetchStats();
    } catch(e) {
        Alert.alert("Erreur", "Impossible de valider la présence.");
    }
  };

  // --- ACTION : SAUVEGARDER L'IDENTITÉ ---
  const choisirIdentite = async (joueur: any) => {
      await AsyncStorage.setItem('monJoueurId', joueur.id.toString());
      setMyId(joueur.id.toString());
      setModalIdentityVisible(false);
      
      // On badge directement après avoir choisi
      setTimeout(() => badgerPresence(), 500);
  };

  // --- ACTION : COACH (Appel manuel) ---
  const noterManuel = async (id: number, statut: string) => {
    try {
        await fetch(`${API_URL}/presences`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ joueur_id: id, date: today, statut: statut })
        });
    } catch(e) {}
  };

  const renderBarre = (pourcentage: number) => {
      let color = '#e74c3c';
      if (pourcentage > 50) color = '#f1c40f';
      if (pourcentage > 80) color = '#27ae60';
      return (
          <View style={styles.barreFond}>
              <View style={[styles.barreRemplie, {width: `${pourcentage}%`, backgroundColor: color}]} />
          </View>
      );
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.headerBox}>
          <View>
              <Text style={styles.titre}>Assiduité Club</Text>
              <Text style={styles.sousTitre}>{today}</Text>
          </View>
          {/* BOUTON BADGER (Gros bouton d'action) */}
          <TouchableOpacity 
            style={[styles.btnBadge, dejaBadge && styles.btnBadgeDone]} 
            onPress={badgerPresence}
            disabled={dejaBadge}
          >
             <Ionicons name={dejaBadge ? "checkmark-circle" : "finger-print"} size={24} color="white" />
             <Text style={styles.btnBadgeText}>{dejaBadge ? "PRÉSENT" : "JE SUIS LÀ"}</Text>
          </TouchableOpacity>
      </View>

      {/* LISTE DES STATS */}
      <FlatList 
        data={stats}
        keyExtractor={(item: any, index) => index.toString()}
        ListHeaderComponent={<Text style={styles.sectionTitle}>CLASSEMENT (TOP ASSIDUITÉ)</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Aucune donnée.</Text>}
        renderItem={({item}) => (
            <View style={styles.card}>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 5}}>
                    <Text style={styles.nom}>{item.nom}</Text>
                    <Text style={styles.pc}>{item.pourcentage}%</Text>
                </View>
                {renderBarre(item.pourcentage)}
                <Text style={styles.details}>{item.present}/{item.total} séances</Text>
            </View>
        )}
      />

      {/* BOUTON COACH (Visible uniquement si Admin) */}
      {isAdmin && (
          <TouchableOpacity style={styles.fabAdmin} onPress={() => setModalAppelVisible(true)}>
              <Ionicons name="list" size={24} color="white" />
              <Text style={{color:'white', fontWeight:'bold', marginLeft: 5, fontSize: 12}}>GESTION</Text>
          </TouchableOpacity>
      )}

      {/* MODAL 1 : QUI SUIS-JE ? (Première fois uniquement) */}
      <Modal visible={modalIdentityVisible} animationType="slide">
          <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Identification</Text>
              <Text style={styles.modalSub}>Qui êtes-vous dans la liste ?</Text>
              <Text style={{textAlign:'center', color:'#e74c3c', marginBottom: 20, fontSize:12}}>Cette action liera ce téléphone à ce joueur.</Text>
              
              <FlatList
                data={joueurs}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.identityRow} onPress={() => choisirIdentite(item)}>
                        <Ionicons name="person-circle-outline" size={30} color="#34495e" />
                        <Text style={styles.identityName}>{item.nom} {item.prenom}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
                    </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalIdentityVisible(false)}>
                  <Text style={{color:'white'}}>Annuler</Text>
              </TouchableOpacity>
          </View>
      </Modal>

      {/* MODAL 2 : APPEL MANUEL (Pour le coach) */}
      <Modal visible={modalAppelVisible} animationType="slide">
          <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Gestion Manuelle</Text>
              <Text style={styles.modalSub}>Cochez pour ceux qui ont oublié leur téléphone</Text>
              
              <ScrollView contentContainerStyle={{paddingBottom: 80}}>
                  {joueurs.map((j: any) => (
                      <View key={j.id} style={styles.appelRow}>
                          <Text style={styles.appelNom}>{j.nom} {j.prenom}</Text>
                          <View style={{flexDirection:'row', gap: 10}}>
                              <TouchableOpacity style={styles.btnAbsent} onPress={() => noterManuel(j.id, 'absent')}>
                                  <Ionicons name="close" size={20} color="white" />
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.btnPresent} onPress={() => noterManuel(j.id, 'present')}>
                                  <Ionicons name="checkmark" size={20} color="white" />
                              </TouchableOpacity>
                          </View>
                      </View>
                  ))}
              </ScrollView>
              <TouchableOpacity style={styles.closeBtn} onPress={() => { setModalAppelVisible(false); fetchStats(); }}>
                  <Text style={{color:'white', fontWeight:'bold'}}>Terminer</Text>
              </TouchableOpacity>
          </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7", padding: 15 },
  
  // Header avec Bouton Badge
  headerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'white', padding: 15, borderRadius: 15, elevation: 2 },
  titre: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  sousTitre: { color: 'gray', fontSize: 12 },
  
  btnBadge: { backgroundColor: '#3498db', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  btnBadgeDone: { backgroundColor: '#27ae60' }, // Vert quand c'est fait
  btnBadgeText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },

  sectionTitle: { fontWeight: 'bold', color: '#7f8c8d', marginBottom: 10, marginTop: 10 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10 },
  nom: { fontWeight: 'bold', fontSize: 16, color: '#2c3e50' },
  pc: { fontWeight: 'bold', color: '#2c3e50' },
  barreFond: { height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, overflow: 'hidden' },
  barreRemplie: { height: '100%' },
  details: { fontSize: 10, color: 'gray', marginTop: 5, textAlign: 'right' },
  empty: { textAlign: 'center', marginTop: 30, color: 'gray' },

  // Bouton Coach flottant
  fabAdmin: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#2c3e50', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 30, flexDirection:'row', alignItems:'center', elevation: 5 },

  // Modal Identity
  modalContainer: { flex: 1, backgroundColor: 'white', padding: 20, marginTop: 50, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50' },
  modalSub: { textAlign: 'center', color: 'gray', marginBottom: 10 },
  identityRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  identityName: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  
  // Modal Appel
  appelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  appelNom: { fontSize: 16, fontWeight: '600' },
  btnPresent: { backgroundColor: '#27ae60', padding: 10, borderRadius: 20 },
  btnAbsent: { backgroundColor: '#e74c3c', padding: 10, borderRadius: 20 },
  
  closeBtn: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#3498db', padding: 15, borderRadius: 10, alignItems: 'center' }
});