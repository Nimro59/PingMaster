import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert, TextInput, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Définition d'un Club dans l'appli
interface MyClub {
  id: number;
  nom: string;
  role: 'admin' | 'joueur'; // Le rôle est lié au club !
}

export default function SettingsScreen() {
  const router = useRouter();

  // État global
  const [mesClubs, setMesClubs] = useState<MyClub[]>([]);
  const [activeClubId, setActiveClubId] = useState<number | null>(null);
  
  // Modals
  const [modalClubVisible, setModalClubVisible] = useState(false);
  const [modalAddVisible, setModalAddVisible] = useState(false);
  
  // Formulaire ajout club
  const [newClubName, setNewClubName] = useState("");
  const [newClubCode, setNewClubCode] = useState(""); // Code coach pour devenir admin

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      // 1. On récupère la liste des clubs enregistrés
      const storedClubs = await AsyncStorage.getItem('mesClubs');
      const storedActiveId = await AsyncStorage.getItem('activeClubId');

      if (storedClubs) {
        const clubsParsed = JSON.parse(storedClubs);
        setMesClubs(clubsParsed);
        
        // Si on a un club actif sauvegardé, on le remet, sinon le premier de la liste
        if (storedActiveId) {
            setActiveClubId(parseInt(storedActiveId));
        } else if (clubsParsed.length > 0) {
            setActiveClubId(clubsParsed[0].id);
        }
      } else {
        // Données par défaut pour la première ouverture (Démo)
        const demoData: MyClub[] = [
            { id: 1, nom: 'As St-Vincent-Bragny', role: 'admin' },
            { id: 2, nom: 'JS Ouroux-sur-Saône', role: 'joueur' }
        ];
        setMesClubs(demoData);
        setActiveClubId(1);
        sauvegarder(demoData, 1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sauvegarder = async (clubs: MyClub[], activeId: number | null) => {
    await AsyncStorage.setItem('mesClubs', JSON.stringify(clubs));
    if (activeId) await AsyncStorage.setItem('activeClubId', activeId.toString());
  };

  const switchClub = (club: MyClub) => {
    setActiveClubId(club.id);
    AsyncStorage.setItem('activeClubId', club.id.toString());
    setModalClubVisible(false);
    
    // Petit feedback visuel
    Alert.alert("Changement effectué", `Vous êtes maintenant sur l'espace de ${club.nom}`);
    
    router.replace("/(tabs)"); // Optionnel : renvoyer vers l'accueil
  };

  const ajouterClub = () => {
      // Simulation : Si le code est "COACH", on devient admin, sinon joueur
      const role = newClubCode === "PING" ? 'admin' : 'joueur';
      
      const nouveau: MyClub = {
          id: Date.now(), // ID unique basé sur l'heure
          nom: newClubName || "Nouveau Club",
          role: role
      };

      const nouvelleListe = [...mesClubs, nouveau];
      setMesClubs(nouvelleListe);
      setActiveClubId(nouveau.id); // On bascule direct dessus
      
      sauvegarder(nouvelleListe, nouveau.id);
      
      setModalAddVisible(false);
      setModalClubVisible(false);
      setNewClubName("");
      setNewClubCode("");
      
      Alert.alert("Bienvenue", `Club ajouté en tant que ${role.toUpperCase()}`);
  };

  // On récupère l'objet du club actif pour l'affichage
  const activeClub = mesClubs.find(c => c.id === activeClubId) || mesClubs[0];

  return (
    <View style={styles.container}>
      
      {/* CARTE DU CLUB ACTIF */}
      <View style={styles.clubCard}>
        <Text style={styles.cardLabel}>ESPACE ACTUEL</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setModalClubVisible(true)}>
            <View>
                <Text style={styles.clubName}>{activeClub?.nom}</Text>
                <View style={[styles.roleBadge, { backgroundColor: activeClub?.role === 'admin' ? '#e74c3c' : '#3498db' }]}>
                    <Text style={styles.roleText}>{activeClub?.role === 'admin' ? 'ADMINISTRATEUR' : 'JOUEUR'}</Text>
                </View>
            </View>
            <Ionicons name="swap-vertical" size={28} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      {/* PARAMÈTRES GÉNÉRAUX */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PRÉFÉRENCES</Text>
        <View style={styles.row}>
            <Text style={styles.optionText}>Notifications</Text>
            <Switch value={true} trackColor={{true: '#2c3e50'}} />
        </View>
        <View style={styles.row}>
            <Text style={styles.optionText}>Thème Sombre</Text>
            <Switch value={false} />
        </View>
      </View>

      <Text style={styles.version}>PingMaster v1.1 - ID Club: {activeClubId}</Text>

      {/* --- MODAL 1 : SÉLECTION DU CLUB --- */}
      <Modal visible={modalClubVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Mes Clubs</Text>
                
                <FlatList
                    data={mesClubs}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({item}) => (
                        <TouchableOpacity 
                            style={[styles.clubItem, item.id === activeClubId && styles.clubItemActive]}
                            onPress={() => switchClub(item)}
                        >
                            <Text style={[styles.itemText, item.id === activeClubId && {color:'white', fontWeight:'bold'}]}>
                                {item.nom}
                            </Text>
                            {item.id === activeClubId && <Ionicons name="checkmark-circle" size={24} color="white" />}
                        </TouchableOpacity>
                    )}
                />

                <TouchableOpacity style={styles.btnAdd} onPress={() => setModalAddVisible(true)}>
                    <Ionicons name="add-circle" size={24} color="#2c3e50" />
                    <Text style={{marginLeft: 10, fontWeight:'bold', color: '#2c3e50'}}>Rejoindre un autre club</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnClose} onPress={() => setModalClubVisible(false)}>
                    <Text style={{color: 'gray'}}>Fermer</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* --- MODAL 2 : AJOUTER UN CLUB --- */}
      <Modal visible={modalAddVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {height: 'auto'}]}>
                <Text style={styles.modalTitle}>Nouveau Club</Text>
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Nom du club ou Numéro"
                    value={newClubName}
                    onChangeText={setNewClubName}
                />
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Code Admin (Optionnel)"
                    placeholderTextColor="#aaa"
                    value={newClubCode}
                    onChangeText={setNewClubCode}
                />

                <TouchableOpacity style={styles.btnConfirm} onPress={ajouterClub}>
                    <Text style={{color:'white', fontWeight:'bold'}}>Valider</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={{marginTop: 15}} onPress={() => setModalAddVisible(false)}>
                    <Text style={{color:'gray'}}>Annuler</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7", padding: 20 },
  clubCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 25, elevation: 4 },
  cardLabel: { fontSize: 12, color: '#95a5a6', fontWeight: 'bold', marginBottom: 10 },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clubName: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 5 },
  roleText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  
  section: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 20 },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#bdc3c7', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  optionText: { fontSize: 16, color: '#2c3e50' },
  version: { textAlign: 'center', color: '#bdc3c7', marginTop: 10 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', height: '50%', backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  clubItem: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 15, borderRadius: 10, backgroundColor: '#f1f2f6', marginBottom: 10 },
  clubItemActive: { backgroundColor: '#2c3e50' },
  itemText: { fontSize: 16, color: '#2c3e50' },
  
  btnAdd: { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 10 },
  btnClose: { marginTop: 20 },
  
  input: { width: '100%', backgroundColor: '#f1f2f6', padding: 15, borderRadius: 10, marginBottom: 10 },
  helper: { fontSize: 12, color: 'gray', marginBottom: 20, alignSelf:'flex-start' },
  btnConfirm: { width: '100%', backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center' }
});