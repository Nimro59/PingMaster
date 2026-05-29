import os
import psycopg2
from psycopg2.extras import RealDictCursor
import sqlite3

DATABASE_URL = os.getenv("DATABASE_URL")

class PostgresWrapper:
    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        original_execute = cursor.execute

        def execute_wrapper(query, vars=None):
            postgres_query = query.replace("?", "%s")
            return original_execute(postgres_query, vars)
        
        cursor.execute = execute_wrapper
        return cursor

    def commit(self):
        self.conn.commit()
        
    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()

def get_db_connection():
    if DATABASE_URL:
        conn = psycopg2.connect(DATABASE_URL)
        return PostgresWrapper(conn)
    else:
        conn = sqlite3.connect('pingpong.db')
        conn.row_factory = sqlite3.Row
        return conn

def initialiser_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    serial_type = "SERIAL" if DATABASE_URL else "INTEGER"
    autoincrement = "" if DATABASE_URL else "AUTOINCREMENT"

    tables = [
        f"""
        CREATE TABLE IF NOT EXISTS joueurs (
            id {serial_type} PRIMARY KEY {autoincrement},
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            points REAL DEFAULT 500.0,
            club TEXT DEFAULT 'Mon Club'
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS posts (
            id {serial_type} PRIMARY KEY {autoincrement},
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            auteur TEXT NOT NULL,
            titre TEXT NOT NULL,
            contenu TEXT NOT NULL,
            type TEXT DEFAULT 'info'
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS evenements (
            id {serial_type} PRIMARY KEY {autoincrement},
            titre TEXT NOT NULL,
            date TEXT NOT NULL,
            heure TEXT NOT NULL,
            type TEXT DEFAULT 'entrainement',
            lieu TEXT DEFAULT 'Salle du Club',
            description TEXT
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS presences (
            id {serial_type} PRIMARY KEY {autoincrement},
            joueur_id INTEGER,
            date TEXT,
            statut TEXT,
            FOREIGN KEY(joueur_id) REFERENCES joueurs(id)
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS tournois (
            id {serial_type} PRIMARY KEY {autoincrement},
            nom TEXT NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'inscription',
            nb_tables INTEGER DEFAULT 4
        );
        """,
        f"""
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
        """,
        f"""
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
        """,
        f"""
        CREATE TABLE IF NOT EXISTS messages (
            id {serial_type} PRIMARY KEY {autoincrement},
            poule TEXT,
            texte TEXT NOT NULL,
            auteur TEXT NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    ]

    for query in tables:
        try:
            cursor.execute(query)
            conn.commit()
        except Exception as e:
            conn.rollback()

    conn.close()
    print("Base de données initialisée.")

if __name__ == "__main__":
    initialiser_db()