import sqlite3


LISTE_CLUB = [
    {"licence": "781505", "nom": "Carisel", "prenom": "Jérémy", "points": 960.0},
    {"licence": "88533", "nom": "Delaborde", "prenom": "Nicole", "points": 696.0},
    {"licence": "7114492", "nom": "Morin", "prenom": "Gabriel", "points": 620.0},
    {"licence": "7110159", "nom": "Bernigaud", "prenom": "Christian", "points": 593.0},
    {"licence": "7110282", "nom": "Pessin", "prenom": "Jean-Marc", "points": 558.0},
]

def importer_donnees():
    print("🚀 Démarrage de l'importation...")
    
    # Connexion à la base existante
    conn = sqlite3.connect('pingpong.db')
    cursor = conn.cursor()

    joueurs_ajoutes = 0
    joueurs_mis_a_jour = 0

    for joueur in LISTE_CLUB:
        # On vérifie si le joueur existe déjà (par sa licence)
        cursor.execute("SELECT id FROM joueurs WHERE licence = ?", (joueur["licence"],))
        existant = cursor.fetchone()

        if existant:
            # S'il existe, on met juste à jour ses points (Update)
            cursor.execute("""
                UPDATE joueurs 
                SET nom = ?, prenom = ?, points = ? 
                WHERE licence = ?
            """, (joueur["nom"], joueur["prenom"], joueur["points"], joueur["licence"]))
            joueurs_mis_a_jour += 1
        else:
            # S'il n'existe pas, on le crée (Insert)
            cursor.execute("""
                INSERT INTO joueurs (licence, nom, prenom, points, club)
                VALUES (?, ?, ?, ? ,?)
            """, (joueur["licence"], joueur["nom"], joueur["prenom"], joueur["points"], "Mon Club"))
            joueurs_ajoutes += 1

    conn.commit()
    conn.close()

    print("------------------------------------------------")
    print(f"✅ Terminé !")
    print(f"➕ Nouveaux joueurs ajoutés : {joueurs_ajoutes}")
    print(f"🔄 Joueurs mis à jour : {joueurs_mis_a_jour}")
    print("------------------------------------------------")

if __name__ == "__main__":
    importer_donnees()