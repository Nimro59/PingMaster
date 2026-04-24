import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MaillotScreen() {
  const [couleurBuste, setCouleurBuste] = useState('#e74c3c'); // Rouge par défaut
  const [couleurManches, setCouleurManches] = useState('#c0392b'); // Rouge foncé
  const [nomDos, setNomDos] = useState("MON NOM");
  const [numero, setNumero] = useState("10");

  const couleursDispo = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#2c3e50', '#ffffff', '#000000'];

  const sauvegarderMaillot = () => {
    Alert.alert("Sauvegardé !", "Ton design a été enregistré dans la galerie du club.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>Studio Maillot 👕</Text>

      {/* --- ZONE DE VISUALISATION (Le Maillot) --- */}
      <View style={styles.previewZone}>
        <View style={styles.maillotContainer}>
            {/* Manches (Derrière) */}
            <View style={[styles.mancheGauche, { backgroundColor: couleurManches }]} />
            <View style={[styles.mancheDroite, { backgroundColor: couleurManches }]} />
            
            {/* Buste (Devant) */}
            <View style={[styles.buste, { backgroundColor: couleurBuste }]}>
                {/* Col */}
                <View style={styles.col} />
                
                {/* Flocage */}
                <Text style={styles.flocageNom}>{nomDos.toUpperCase()}</Text>
                <Text style={styles.flocageNum}>{numero}</Text>
            </View>
        </View>
      </View>

      {/* --- ZONE DE CONTRÔLE --- */}
      <View style={styles.controls}>
        
        {/* Choix Couleur Buste */}
        <Text style={styles.label}>Couleur Principale</Text>
        <View style={styles.palette}>
            {couleursDispo.map(c => (
                <TouchableOpacity 
                    key={`buste-${c}`} 
                    style={[styles.colorDot, {backgroundColor: c}, couleurBuste === c && styles.selectedDot]}
                    onPress={() => setCouleurBuste(c)}
                />
            ))}
        </View>

        {/* Choix Couleur Manches */}
        <Text style={styles.label}>Couleur Manches</Text>
        <View style={styles.palette}>
            {couleursDispo.map(c => (
                <TouchableOpacity 
                    key={`manche-${c}`} 
                    style={[styles.colorDot, {backgroundColor: c}, couleurManches === c && styles.selectedDot]}
                    onPress={() => setCouleurManches(c)}
                />
            ))}
        </View>

        {/* Flocage */}
        <Text style={styles.label}>Personnalisation</Text>
        <View style={styles.inputRow}>
            <TextInput 
                style={[styles.input, {flex: 2}]} 
                placeholder="Nom" 
                value={nomDos} 
                onChangeText={setNomDos} 
                maxLength={10}
            />
            <TextInput 
                style={[styles.input, {flex: 1, marginLeft: 10}]} 
                placeholder="N°" 
                value={numero} 
                onChangeText={setNumero} 
                keyboardType="numeric"
                maxLength={2}
            />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={sauvegarderMaillot}>
            <Ionicons name="save-outline" size={24} color="white" style={{marginRight: 10}} />
            <Text style={styles.saveText}>Enregistrer le design</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f3f5f7', minHeight: '100%' },
  titre: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20, textAlign: 'center' },
  
  // Le Maillot CSS
  previewZone: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  maillotContainer: { width: 200, height: 220, position: 'relative', alignItems: 'center' },
  buste: { width: 140, height: 200, borderRadius: 15, alignItems: 'center', zIndex: 2, justifyContent: 'center' },
  mancheGauche: { position: 'absolute', top: 0, left: -20, width: 60, height: 90, transform: [{rotate: '-20deg'}], borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  mancheDroite: { position: 'absolute', top: 0, right: -20, width: 60, height: 90, transform: [{rotate: '20deg'}], borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  col: { position: 'absolute', top: -15, width: 60, height: 30, backgroundColor: '#f3f5f7', borderRadius: 30 },
  
  // Flocage
  flocageNom: { fontSize: 16, fontWeight: 'bold', color: 'white', marginTop: -20 },
  flocageNum: { fontSize: 45, fontWeight: 'bold', color: 'white' },

  // Contrôles
  controls: { backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 3 },
  label: { fontWeight: 'bold', color: '#7f8c8d', marginBottom: 10, marginTop: 10 },
  palette: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 },
  colorDot: { width: 30, height: 30, borderRadius: 15, margin: 5, borderWidth: 1, borderColor: '#ddd' },
  selectedDot: { borderWidth: 3, borderColor: '#34495e' },
  inputRow: { flexDirection: 'row' },
  input: { backgroundColor: '#f1f2f6', padding: 12, borderRadius: 8, fontSize: 16 },
  
  saveBtn: { flexDirection: 'row', backgroundColor: '#27ae60', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 25 },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});