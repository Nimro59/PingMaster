import sqlite3

def initialiser_db():
    conn = sqlite3.connect('pingpong.db')
    cursor = conn.cursor()

# Table VESTIAIRE (Publications)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        auteur TEXT NOT NULL,
        titre TEXT NOT NULL,
        contenu TEXT NOT NULL,
        type TEXT DEFAULT 'info' -- 'info', 'resultat', 'urgent'
    );
    """)

# Table ÉVÈNEMENTS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evenements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titre TEXT NOT NULL,
        date TEXT NOT NULL,  -- Format YYYY-MM-DD
        heure TEXT NOT NULL, -- Format HH:MM
        type TEXT DEFAULT 'entrainement', -- 'entrainement', 'match', 'reunion', 'autre'
        lieu TEXT DEFAULT 'Salle du Club',
        description TEXT
    );
    """)

    # Table JOUEURS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS joueurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        licence TEXT UNIQUE,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        points REAL,
        club TEXT
    );
    """)

    # Table PRÉSENCES (Assiduité)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS presences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        joueur_id INTEGER,
        date TEXT, -- YYYY-MM-DD
        statut TEXT, -- 'present', 'absent', 'excuse', 'blesse'
        FOREIGN KEY(joueur_id) REFERENCES joueurs(id)
    );
    """)

    # Table MATCHS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS matchs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        gagnant_id INTEGER,
        perdant_id INTEGER,
        points_echanges REAL,
        FOREIGN KEY(gagnant_id) REFERENCES joueurs(id),
        FOREIGN KEY(perdant_id) REFERENCES joueurs(id)
    );
    """)
    
    # Table TOURNOIS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tournois (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        date DATE DEFAULT CURRENT_DATE,
        status TEXT DEFAULT 'inscription', -- 'inscription', 'poules', 'tableau', 'termine'
        nb_tables INTEGER DEFAULT 4
    );
    """)

    # Table PARTICIPATIONS (Lien Joueur <-> Tournoi)
    # On permet d'ajouter soit un ID de joueur existant, soit un nom "invité"
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS participants_tournoi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournoi_id INTEGER,
        joueur_id INTEGER NULL, -- Si c'est un membre du club
        nom_invite TEXT NULL,   -- Si c'est un externe
        points_depart INTEGER DEFAULT 500, -- Pour le tri des poules
        FOREIGN KEY(tournoi_id) REFERENCES tournois(id),
        FOREIGN KEY(joueur_id) REFERENCES joueurs(id)
    );
    """)

    # MIGRATION : Ajout de la colonne 'poule' si elle manque
    try:
        cursor.execute("ALTER TABLE participants_tournoi ADD COLUMN poule TEXT")
    except:
        pass # La colonne existe déjà

    # Table MATCHS DE TOURNOI (Séparée des matchs officiels)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS matchs_tournoi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournoi_id INTEGER,
        poule TEXT, -- 'A', 'B', 'C' ou 'Tableau'
        joueur1_id INTEGER, -- ID du participant (pas du joueur global)
        joueur2_id INTEGER,
        score1 INTEGER DEFAULT 0,
        score2 INTEGER DEFAULT 0,
        termine BOOLEAN DEFAULT 0,
        FOREIGN KEY(tournoi_id) REFERENCES tournois(id)
    );
    """)

    # MIGRATION FORCÉE : Ajout des colonnes manquantes
    # On vérifie si la colonne 'tour' existe dans matchs_tournoi
    cursor.execute("PRAGMA table_info(matchs_tournoi)")
    colonnes = [info[1] for info in cursor.fetchall()]
    
    if 'tour' not in colonnes:
        print("⚠️ Colonne 'tour' manquante. Ajout en cours...")
        cursor.execute("ALTER TABLE matchs_tournoi ADD COLUMN tour TEXT")
        
    if 'poule' not in colonnes:
        # Cas théorique si la table a été recréée
        pass

    # Table MESSAGERIE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        club_id INTEGER DEFAULT 1,
        auteur TEXT NOT NULL,
        contenu TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    print("✅ Base de données vérifiée.")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    initialiser_db()