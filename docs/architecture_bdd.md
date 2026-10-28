# 🗄️ Architecture de la Base de Données

## 1. Fonctionnement Hybride (SQLite / PostgreSQL)

Afin de faciliter le développement local tout en garantissant une persistance fiable en production, le module `src/backend/database.py` implémente une détection automatique de l'environnement via la variable `DATABASE_URL` :

* **Développement local (`DATABASE_URL` absente) :** Connexion directe au fichier local `pingpong.db` via le module standard `sqlite3` avec `sqlite3.Row`.
* **Production Cloud (`DATABASE_URL` présente) :** Connexion à la base **PostgreSQL** hébergée sur **Neon.tech** via `psycopg2`.

### Le `PostgresWrapper`
Les requêtes SQL du projet étant initialement rédigées avec des marqueurs positionnels SQLite (`?`), la classe `PostgresWrapper` intercepte les appels au curseur pour :
1. Convertir dynamiquement les paramètres `?` en `%s` (syntaxe attendue par `psycopg2`).
2. Appliquer le curseur `DictCursor` (ou `RealDictCursor`) afin de permettre l'accès aux colonnes aussi bien par clé nommée (`row["nom"]`) que par indexation tuple, assurant une compatibilité totale avec le reste de l'API.

### Sécurisation des Transactions au Démarrage
PostgreSQL verrouillant l'intégralité d'une transaction dès la moindre erreur SQL (`InFailedSqlTransaction`), la fonction `initialiser_db()` appelée à l'événement `startup` de FastAPI exécute et valide (`conn.commit()`) la création de chaque table dans un bloc `try...except` indépendant avec `conn.rollback()` en cas d'exception.

---

## 2. Schéma Relationnel des Tables

### Table `joueurs`
Stocke les membres officiels du club et leur classement.
| Colonne | Type (PG / SQLite) | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY` | Identifiant unique du joueur |
| `nom` | `TEXT` | `NOT NULL` | Nom de famille |
| `prenom` | `TEXT` | `NOT NULL` | Prénom |
| `points` | `REAL` | `DEFAULT 500.0` | Points officiels ou classement interne |
| `club` | `TEXT` | `DEFAULT 'Mon Club'` | Nom du club d'appartenance |

### Table `presences`
Historique des pointages d'assiduité aux séances d'entraînement.
| Colonne | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY` | Identifiant du pointage |
| `joueur_id` | `INTEGER` | `FOREIGN KEY -> joueurs(id)` | Joueur concerné |
| `date` | `TEXT` | | Date de la séance (format ISO `YYYY-MM-DD`) |
| `statut` | `TEXT` | | État de présence (ex: `present`, `absent`) |

### Table `posts`
Annonces et publications du fil d'actualité du club.
| Colonne | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY` | Identifiant de l'annonce |
| `date` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Date et heure de publication |
| `auteur` | `TEXT` | `NOT NULL` | Nom de l'auteur de la publication |
| `titre` | `TEXT` | `NOT NULL` | Titre de l'annonce |
| `contenu` | `TEXT` | `NOT NULL` | Corps du message |
| `type` | `TEXT` | `DEFAULT 'info'` | Catégorie (`info`, `alerte`, `resultat`) |

### Table `evenements`
Agenda des entraînements, rencontres de championnat et manifestations.
| Colonne | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY` | Identifiant de l'événement |
| `titre` | `TEXT` | `NOT NULL` | Intitulé de l'événement |
| `date` | `TEXT` | `NOT NULL` | Date prévue |
| `heure` | `TEXT` | `NOT NULL` | Heure de début |
| `type` | `TEXT` | `DEFAULT 'entrainement'` | Type (`entrainement`, `competition`, `reunion`) |
| `lieu` | `TEXT` | `DEFAULT 'Salle du Club'` | Localisation |
| `description`| `TEXT` | `NULL` | Informations complémentaires |

### Table `tournois`
Entête et configuration générale d'un tournoi interne.
| Colonne | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY` | Identifiant du tournoi |
| `nom` | `TEXT` | `NOT NULL` | Nom de la compétition |
| `date` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Date de création |
| `status` | `TEXT` | `DEFAULT 'inscription'` | Phase (`inscription`, `poules`, `tableau`, `termine`) |
| `nb_tables` | `INTEGER` | `DEFAULT 4` | Nombre de tables disponibles dans la salle |

### Table `participants_tournoi`
Table de liaison gérant à la fois les joueurs licenciés au club et les invités externes.
| Colonne | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY` | Identifiant d'inscription au tournoi |
| `tournoi_id` | `INTEGER` | `FOREIGN KEY -> tournois(id)`| Tournoi de rattachement |
| `joueur_id` | `INTEGER` | `NULL`, `FK -> joueurs(id)` | Renseigné si le joueur est membre du club |
| `nom_invite` | `TEXT` | `NULL` | Renseigné si le joueur est un invité externe |
| `points_depart`| `INTEGER` | `DEFAULT 500` | Points pris en compte pour le placement en poule |
| `poule` | `TEXT` | `NULL` | Lettre de la poule attribuée (`A`, `B`, `C`...) |

### Table `matchs_tournoi`
Stocke toutes les rencontres d'un tournoi (phase de poules et tableau à élimination directe).
| Colonne | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY` | Identifiant du match |
| `tournoi_id` | `INTEGER` | `FOREIGN KEY -> tournois(id)`| Tournoi de rattachement |
| `poule` | `TEXT` | `NULL` | Lettre de la poule ou `'TABLEAU'` pour la phase finale |
| `joueur1_id` | `INTEGER` | `NULL` | ID dans `participants_tournoi` (`NULL` si Exempté) |
| `joueur2_id` | `INTEGER` | `NULL` | ID dans `participants_tournoi` (`NULL` si Exempté) |
| `score1` | `INTEGER` | `DEFAULT 0` | Manches ou points remportés par le joueur 1 |
| `score2` | `INTEGER` | `DEFAULT 0` | Manches ou points remportés par le joueur 2 |
| `termine` | `BOOLEAN` | `DEFAULT False` | Indique si le résultat du match est validé |
| `tour` | `TEXT` | `NULL` | Niveau du match (`Poule`, `1/8`, `1/4`, `1/2`, `Finale`) |

### Table `messages`
Historique des messages échangés dans le chat du club ou par poule.
| Colonne | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY` | Identifiant du message |
| `poule` | `TEXT` | `NULL` | Canal de discussion (`general` ou lettre de poule) |
| `texte` | `TEXT` | `NOT NULL` | Contenu du message |
| `auteur` | `TEXT` | `NOT NULL` | Nom de l'expéditeur |
| `date` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Horodatage de l'envoi |