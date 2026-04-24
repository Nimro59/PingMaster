import React, { useState, useCallback } from "react";
import { Text, View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

const API_URL = "http://192.168.213.71:8000"; 

type Post = {
  id: number;
  auteur: string;
  date: string;
  titre: string;
  contenu: string;
  type?: string;
};

export default function Vestiaires() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Formulaire nouveau post
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/vestiaire`);
      const data = await response.json();
      setPosts(data);
      setRefreshing(false);
    } catch (error) {
      console.error(error);
      setRefreshing(false);
    }
  };

  const publierPost = async () => {
    if (!titre || !contenu) return;
    
    try {
      await fetch(`${API_URL}/vestiaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            auteur: "Coach", // Pour l'instant en dur, plus tard via compte
            titre: titre,
            contenu: contenu,
            type: "info"
        })
      });
      setModalVisible(false);
      setTitre("");
      setContenu("");
      fetchPosts(); // On recharge la liste
    } catch (e) {
        Alert.alert("Erreur", "Impossible de publier");
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.card}>
      <View style={styles.headerPost}>
        <Ionicons name="person-circle" size={40} color="#34495e" />
        <View style={{marginLeft: 10}}>
            <Text style={styles.auteur}>{item.auteur}</Text>
            <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
      <Text style={styles.titrePost}>{item.titre}</Text>
      <Text style={styles.contenu}>{item.contenu}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Liste des posts */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPosts} />}
        ListHeaderComponent={<Text style={styles.pageTitle}>📢 Vestiaires</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Aucune annonce pour le moment.</Text>}
      />

      {/* Bouton Flottant (+) pour ajouter un post */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal de création */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Nouvelle Annonce</Text>
            <TextInput style={styles.input} placeholder="Titre (ex: Match ce weekend)" value={titre} onChangeText={setTitre} />
            <TextInput style={[styles.input, {height: 100}]} placeholder="Message..." multiline value={contenu} onChangeText={setContenu} />
            
            <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.cancel}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity onPress={publierPost}><Text style={styles.publish}>Publier</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7", padding: 15 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  headerPost: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  auteur: { fontWeight: 'bold', fontSize: 16 },
  date: { color: 'gray', fontSize: 12 },
  titrePost: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#2980b9' },
  contenu: { fontSize: 15, lineHeight: 22, color: '#34495e' },
  empty: { textAlign: 'center', marginTop: 50, color: 'gray' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#e74c3c', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalView: { flex: 1, marginTop: 100, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#f1f2f6', padding: 15, borderRadius: 10, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  publish: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
  cancel: { fontSize: 18, color: 'gray' }
});