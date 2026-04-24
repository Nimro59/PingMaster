import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

// On définit le type de données attendu
interface Joueur {
  id: number;
  nom: string;
  prenom: string;
  points: number;
}

interface AutocompleteProps {
  data: Joueur[];             // La liste complète des joueurs
  placeholder: string;        // Texte d'aide (ex: "Chercher le gagnant...")
  onSelect: (id: number | null) => void; // Fonction appelée quand on clique
  resetTrigger: boolean;      // Une variable pour forcer le nettoyage du champ
}

export default function Autocomplete({ data, placeholder, onSelect, resetTrigger }: AutocompleteProps) {
  const [query, setQuery] = useState('');           // Ce que l'utilisateur tape
  const [filteredData, setFilteredData] = useState<Joueur[]>([]); // La liste filtrée
  const [showList, setShowList] = useState(false);  // Afficher ou cacher la liste

  // Si le parent demande un reset (après validation du match)
  useEffect(() => {
    setQuery('');
    setShowList(false);
  }, [resetTrigger]);

  // Fonction de recherche intelligente
  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 0) {
      // ALGO DE RECHERCHE : On filtre si le nom OU le prénom contient le texte
      const filtered = data.filter((item) => {
        const itemData = `${item.nom.toUpperCase()} ${item.prenom.toUpperCase()}`;
        const textData = text.toUpperCase();
        return itemData.includes(textData);
      });
      setFilteredData(filtered);
      setShowList(true);
      onSelect(null); // On remet l'ID à null tant qu'il n'a pas cliqué
    } else {
      setShowList(false);
      onSelect(null);
    }
  };

  const handleSelect = (item: Joueur) => {
    setQuery(`${item.nom} ${item.prenom} (${Math.round(item.points)} pts)`); // On remplit le champ joliment
    setShowList(false); // On cache la liste
    onSelect(item.id);  // On prévient le parent (MatchScreen)
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={handleSearch}
      />
      
      {showList && (
        <View style={styles.listContainer}>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled" // Important pour pouvoir cliquer
            nestedScrollEnabled={true}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
                <Text style={styles.itemText}>
                  {item.nom} {item.prenom} <Text style={styles.points}>({Math.round(item.points)} pts)</Text>
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    zIndex: 1, // Pour que la liste passe au-dessus des autres éléments si besoin
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  listContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 150, // Hauteur max de la liste déroulante
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemText: {
    fontSize: 16,
    color: '#34495e',
  },
  points: {
    fontWeight: 'bold',
    color: '#27ae60',
  },
});