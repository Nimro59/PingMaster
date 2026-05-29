import os
import psycopg2 # type: ignore
from psycopg2.extras import RealDictCursor # type: ignore
import sqlite3

# L'URL de la base sera fournie par Render, sinon on utilise SQLite en local
DATABASE_URL = os.getenv("DATABASE_URL")

class PostgresWrapper:
    """Wrapper intelligent qui traduit la syntaxe SQLite (?) vers PostgreSQL (%s)"""
    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        original_execute = cursor.execute

        def execute_wrapper(query, vars=None):
            # On remplace les ? par des %s pour PostgreSQL
            postgres_query = query.replace("?", "%s")
            return original_execute(postgres_query, vars)
        
        cursor.execute = execute_wrapper
        return cursor

    def commit(self):
        self.conn.commit()

    def close(self):
        self.conn.close()

def get_db_connection():
    if DATABASE_URL:
        # Mode Production (Render)
        conn = psycopg2.connect(DATABASE_URL)
        return PostgresWrapper(conn)
    else:
        # Mode Développement (Local)
        conn = sqlite3.connect('pingpong.db')
        conn.row_factory = sqlite3.Row
        return conn

def initialiser_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # PostgreSQL utilise SERIAL au lieu de AUTOINCREMENT
    serial_type = "SERIAL" if DATABASE_URL else "INTEGER"
    autoincrement = "" if DATABASE_URL else "AUTOINCREMENT"

# Table VESTIAIRE (Publications)
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS posts (
        id {serial_type} PRIMARY KEY {autoincrement},
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        auteur TEXT NOT NULL,
        titre TEXT NOT NULL,
        contenu TEXT NOT NULL,
        type TEXT DEFAULT 'info'
    );
    """)

# Table ÉVÈNEMENTS
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS evenements (
        id {serial_type} PRIMARY KEY {autoincrement},
        titre TEXT NOT NULL,
        date TEXT NOT NULL,
        heure TEXT NOT NULL,
        type TEXT DEFAULT 'entrainement',
        lieu TEXT DEFAULT 'Salle du Club',
        description TEXT
    );
    """)

    # Table JOUEURS
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS joueurs (
        id {serial_type} PRIMARY KEY {autoincrement},
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        points REAL DEFAULT 500.0,
        club TEXT DEFAULT 'Mon Club'
    );
    """)

    # Table PRÉSENCES (Assiduité)
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS presences (
        id {serial_type} PRIMARY KEY {autoincrement},
        joueur_id INTEGER,
        date TEXT,
        statut TEXT,
        FOREIGN KEY(joueur_id) REFERENCES joueurs(id)
    );
    """)

    # Table TOURNOIS
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS tournois (
        id {serial_type} PRIMARY KEY {autoincrement},
        nom TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'inscription',
        nb_tables INTEGER DEFAULT 4
    );
    """)

    # Table PARTICIPATIONS (Lien Joueur <-> Tournoi)
    # On permet d'ajouter soit un ID de joueur existant, soit un nom "invité"
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS participants_tournoi (
        id {serial_type} PRIMARY KEY {autoincrement},
        tournoi_id INTEGER,
        joueur_id INTEGER NULL,
        nom_invite TEXT NULL,
        points_depart INTEGER DEFAULT 500,
        poule TEXT,
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
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS matchs_tournoi (
        id {serial_type} PRIMARY KEY {autoincrement},
        tournoi_id INTEGER,
        poule TEXT,
        joueur1_id INTEGER NULL,
        joueur2_id INTEGER NULL,
        score1 INTEGER DEFAULT 0,
        score2 INTEGER DEFAULT 0,
        termine BOOLEAN DEFAULT False,
        tour TEXT,
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
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS messages (
        id {serial_type} PRIMARY KEY {autoincrement},
        club_id INTEGER DEFAULT 1,
        auteur TEXT NOT NULL,
        contenu TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print("Base de données initialisée avec succès.")

if __name__ == "__main__":
    initialiser_db()