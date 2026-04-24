import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const API_URL = "http://192.168.213.71:8000"; 

interface Message {
  id: number;
  auteur: string;
  contenu: string;
  date: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [pseudo, setPseudo] = useState("Moi"); // Pseudo par défaut
  const [clubId, setClubId] = useState(1);
  
  const flatListRef = useRef<FlatList>(null); // Pour scroller en bas automatiquement

  // Charger le pseudo et le club actif
  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        const storedId = await AsyncStorage.getItem('activeClubId');
        if (storedId) setClubId(parseInt(storedId));
        
        // Ici on pourrait récupérer le vrai nom de l'utilisateur stocké dans les paramètres
        // Pour l'instant on simule :
        setPseudo("Gabriel"); 
      };
      loadUser();
      
      // On lance un rafraichissement automatique toutes les 2 secondes (Polling simple)
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }, [clubId])
  );

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/${clubId}`);
      const data = await response.json();
      setMessages(data);
    } catch (e) {
      console.log("Erreur chat", e);
    }
  };

  const envoyer = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText(""); // On vide le champ direct pour la fluidité

    try {
      await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            club_id: clubId,
            auteur: pseudo,
            contenu: textToSend
        })
      });
      fetchMessages(); // On recharge tout de suite
    } catch (e) {
      console.error(e);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.auteur === pseudo;
    return (
      <View style={[styles.msgContainer, isMe ? styles.alignRight : styles.alignLeft]}>
        {!isMe && <Text style={styles.auteurName}>{item.auteur}</Text>}
        <View style={[styles.bulle, isMe ? styles.bulleMe : styles.bulleOther]}>
            <Text style={[styles.msgText, isMe ? {color:'white'} : {color:'#2c3e50'}]}>
                {item.contenu}
            </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined} 
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text style={styles.empty}>Démarrez la conversation !</Text>}
      />

      <View style={styles.inputZone}>
        <TextInput 
            style={styles.input} 
            placeholder="Écrire un message..." 
            value={inputText}
            onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={envoyer}>
            <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e5ddd5" }, // Couleur fond style WhatsApp
  empty: { textAlign: 'center', marginTop: 100, color: 'gray' },
  
  msgContainer: { marginBottom: 10, maxWidth: '80%' },
  alignRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  alignLeft: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  
  auteurName: { fontSize: 10, color: 'gray', marginBottom: 2, marginLeft: 5 },
  
  bulle: { padding: 10, borderRadius: 15, elevation: 1 },
  bulleMe: { backgroundColor: '#27ae60', borderBottomRightRadius: 0 }, // Vert PingMaster
  bulleOther: { backgroundColor: 'white', borderBottomLeftRadius: 0 },
  
  msgText: { fontSize: 16 },
  
  inputZone: { flexDirection: 'row', padding: 10, backgroundColor: 'white', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f1f2f6', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  sendBtn: { backgroundColor: '#27ae60', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});