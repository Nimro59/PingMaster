import json
import sqlite3

def importer_json_vers_sql():
    # 1. Charger le JSON
    with open('joueurs_data.json', 'r', encoding='utf-8') as f:
        data_json = json.load(f)

    # 2. Connexion à la DB
    conn = sqlite3.connect('pingpong.db')
    cursor = conn.cursor()

    print(f"🔄 Importation de {len(data_json)} joueurs vers SQLite...")

    for j in data_json:
        # Requête SQL d'insertion
        # On utilise ? pour éviter les failles de sécurité (Injection SQL)
        # On met une fausse licence pour l'exemple
        licence_fictive = f"{j['nom'][0]}{j['prenom'][0]}123" 
        
        try:
            cursor.execute("""
                INSERT INTO joueurs (licence, nom, prenom, points, club)
                VALUES (?, ?, ?, ?, ?)
            """, (licence_fictive, j['nom'], j['prenom'], j['points'], j['club']))
        except sqlite3.IntegrityError:
            print(f"⚠️ Le joueur {j['nom']} existe déjà (doublon ignoré).")

    conn.commit()
    conn.close()
    print("✅ Importation terminée.")

def lire_depuis_sql():
    conn = sqlite3.connect('pingpong.db')
    cursor = conn.cursor()

    # Requête pour tout récupérer trié par points
    cursor.execute("SELECT nom, prenom, points FROM joueurs ORDER BY points DESC")
    resultats = cursor.fetchall() # Récupère tout sous forme de liste de tuples

    print("\n--- 📊 Données lues depuis la Base SQL ---")
    for r in resultats:
        # r[0] est le nom, r[1] le prenom, r[2] les points
        print(f"{r[1]} {r[0]} - {r[2]} pts")
    
    conn.close()

# --- Exécution ---
importer_json_vers_sql()
lire_depuis_sql()