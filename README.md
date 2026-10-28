# 🏓 PingMaster

**PingMaster** est une application mobile complète dédiée à la gestion des clubs de tennis de table. Elle centralise le suivi des joueurs, l'organisation des compétitions internes, la gestion de l'assiduité aux entraînements et la communication interne au sein d'une interface mobile moderne.

---

## ✨ Fonctionnalités Principales

* **Organisation de Tournois Internes :**
  * Gestion des inscriptions (membres du club et joueurs invités externes).
  * Répartition équilibrée en poules via l'algorithme du serpentin (*Snake Seeding*) basé sur les points initiaux.
  * Génération automatique de l'ordre des rencontres en phase de poules (*Round-Robin*).
  * Génération du tableau à élimination directe avec calcul de la puissance de 2 supérieure et attribution automatique des exemptés (*Byes*).
  * Saisie rapide des scores en bord de table avec retour haptique (`ScoreModal`).
* **Suivi des Présences & Statistiques :**
  * Pointage rapide des joueurs lors des séances d'entraînement.
  * Classement interne dynamique du club et suivi du taux d'assiduité.
* **Vie du Club & Communication :**
  * Fil d'actualités et annonces officielles du bureau ou des entraîneurs.
  * Calendrier des événements (entraînements, journées de championnat, tournois).
  * Messagerie interne temps réel segmentée par salon ou par poule.
k
---

## 🏗️ Architecture & Stack Technique

Le projet repose sur une architecture client-serveur découplée, conçue pour fonctionner aussi bien en environnement de développement local (SQLite) qu'en production cloud (Render + Neon PostgreSQL).

| Couche | Technologies | Hébergement / Distribution |
| :--- | :--- | :--- |
| **Frontend Mobile** | React Native, Expo Router, TypeScript, Reanimated | Compilation native `.apk` via **EAS Build** & mises à jour **OTA** |
| **Backend API** | Python 3, FastAPI, Uvicorn, Pydantic | Web Service sur **Render** |
| **Base de Données** | PostgreSQL (Prod) / SQLite3 (Dev) | **Neon.tech** (Serverless PostgreSQL) |

---

## 📂 Arborescence du Projet

```
PingMaster/
├── README.md
├── .gitignore
├── docs/                                  # Documentation technique détaillée
│   ├── architecture_bdd.md                # Schéma relationnel et wrapper SQL
│   ├── algorithme_tournoi.md              # Logique Snake Seeding, Poules et Tableau final
│   ├── api_endpoints.md                   # Référence des routes REST FastAPI
│   └── ui_design_system.md                # Charte graphique, composants et workflow EAS
└── src/
    ├── backend/                           # Serveur API Python
    │   ├── api.py                         # Point d'entrée FastAPI et routes métier
    │   ├── database.py                    # Connexion hybride SQLite/PostgreSQL et schéma
    │   └── requirements.txt               # Dépendances Python de production
    └── mobile-app/                        # Application React Native (Expo)
        ├── app.json                       # Configuration Expo et EAS
        ├── babel.config.js                # Configuration Babel / Hermes
        ├── package.json                   # Dépendances Node.js
        ├── constants/                     # Thème graphique (theme.ts) et configuration API
        ├── hooks/                         # Hooks personnalisés (useApi, useTournoi)
        ├── components/                    # Composants UI atomiques et composants métier
        └── app/                           # Écrans et navigation par onglets (Expo Router)
```
📚 Documentation Technique
Pour approfondir le fonctionnement interne de l'application, consultez les guides dédiés dans le dossier docs/ :

Architecture & Base de Données : Fonctionnement du PostgresWrapper, gestion des transactions et structure des tables SQL.

Algorithmes de Tournoi : Explication mathématique et algorithmique du Snake Seeding, du Round-Robin et de l'arbre final.

Référence API REST : Liste des endpoints FastAPI, paramètres attendus et formats de réponse JSON.

Design System & Frontend : Architecture des composants React Native, tokens de couleurs et procédures de déploiement EAS.

🚀 Installation & Lancement en Local
Prérequis
Python 3.10+

Node.js 18+ & npm

Application Expo Go sur mobile ou un émulateur Android

1. Démarrer le Backend (FastAPI)

cd src/backend
python -m venv venv
# Activation sous Windows :
venv\Scripts\activate
# Activation sous Linux / macOS :
source venv/bin/active

pip install -r requirements.txt
uvicorn api:app --host 0.0.0.0 --port 8000 --reload

Note : Sans variable d'environnement DATABASE_URL définie, le serveur crée et utilise automatiquement une base locale pingpong.db (SQLite).

2. Démarrer le Frontend (React Native / Expo)

cd src/mobile-app
npm install
npx expo start

Note : Pour tester sur le réseau local, renseignez l'adresse IP locale de votre machine (http://192.168.X.X:8000) dans src/mobile-app/constants/config.ts.

👤 Auteur
Gabriel MORIN

Étudiant en Licence Informatique Générale — CNAM Chalon-sur-Saône

Technicien Support Utilisateur en alternance — Comeca France Chatenoy-le-Royal

Arbitre Régional (AR) & Juge Arbitre 1er degré (JA1) — FFTT