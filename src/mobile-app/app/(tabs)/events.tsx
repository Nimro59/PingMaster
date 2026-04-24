import React, { useState, useCallback } from "react";
import { Text, View, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

const API_URL = "http://192.168.213.71:8000"; 

interface Evenement {
  id: number;
  titre: string;
  date: string;
  heure: string;
  type: string;
  lieu: string;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Formulaire
  const [titre, setTitre] = useState("");
  const [date, setDate] = useState("01-12-2025"); // Format DD-MM-YYYY
  const [heure, setHeure] = useState("18:00");
  const [type, setType] = useState("entrainement"); // entrainement, match, reunion

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/evenements`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const ajouterEvenement = async () => {
    if (!titre || !date) return;
    try {
      await fetch(`${API_URL}/evenements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, date, heure, type, lieu: "Salle" })
      });
      setModalVisible(false);
      fetchEvents();
    } catch (e) {
      Alert.alert("Erreur", "Impossible de créer l'événement");
    }
  };

  // Fonction pour choisir la couleur selon le type d'événement
  const getColor = (type: string) => {
    switch(type) {
        case 'match': return '#e74c3c'; // Rouge
        case 'entrainement': return '#3498db'; // Bleu
        case 'reunion': return '#9b59b6'; // Violet
        default: return '#95a5a6'; // Gris
    }
  };

  const renderEvent = ({ item }: { item: Evenement }) => (
    <View style={styles.card}>
      {/* Bandeau de couleur à gauche */}
      <View style={[styles.colorStrip, { backgroundColor: getColor(item.type) }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
            <Text style={styles.dateBadge}>{item.date} à {item.heure}</Text>
            <Text style={[styles.typeBadge, { color: getColor(item.type) }]}>{item.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.titre}>{item.titre}</Text>
        <Text style={styles.lieu}>📍 {item.lieu}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={<Text style={styles.pageTitle}>📅 Calendrier</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Aucun événement prévu.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal Ajout Rapide */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Nouvel Événement</Text>
            
            <TextInput style={styles.input} placeholder="Titre (ex: Entraînement Particulier)" value={titre} onChangeText={setTitre} />
            
            <View style={styles.row}>
                <TextInput style={[styles.input, {flex:1, marginRight:5}]} placeholder="JJ-MM-AAAA" value={date} onChangeText={setDate} />
                <TextInput style={[styles.input, {flex:1}]} placeholder="HH:MM" value={heure} onChangeText={setHeure} />
            </View>

            {/* Sélecteur de type simple */}
            <Text style={styles.label}>Type :</Text>
            <View style={styles.typeContainer}>
                {['Entraînement', 'Match', 'Réunion'].map((t) => (
                    <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.typeButton, type === t && {backgroundColor: getColor(t)}]}>
                        <Text style={[styles.typeText, type === t && {color:'white'}]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.btnValider} onPress={ajouterEvenement}>
                <Text style={styles.textValider}>Ajouter au calendrier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop: 15}}>
                <Text style={{color:'gray', textAlign:'center'}}>Annuler</Text>
            </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7", padding: 15 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, marginBottom: 15, elevation: 2, overflow: 'hidden' },
  colorStrip: { width: 6, height: '100%' },
  content: { flex: 1, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  dateBadge: { color: 'gray', fontSize: 12, fontWeight: '600' },
  typeBadge: { fontSize: 10, fontWeight: 'bold' },
  titre: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5 },
  lieu: { fontSize: 13, color: '#7f8c8d' },
  empty: { textAlign: 'center', marginTop: 50, color: 'gray' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#34495e', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  // Styles Modal
  modalView: { flex: 1, marginTop: 100, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign:'center' },
  input: { backgroundColor: '#f1f2f6', padding: 12, borderRadius: 8, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontWeight: 'bold', marginBottom: 10 },
  typeContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  typeButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  typeText: { fontSize: 12, fontWeight: 'bold' },
  btnValider: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center' },
  textValider: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});