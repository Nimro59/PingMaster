# 🏓 PingMaster

**PingMaster** est une application mobile complète conçue pour la gestion moderne d'un club de tennis de table. Elle permet de digitaliser le suivi des joueurs, la communication interne et la gestion avancée des tournois.

## ✨ Fonctionnalités Principales

* **Organisation de Tournois :** Algorithme de compétition (Snake Seeding, Round-Robin), gestion des inscrits, et génération automatique de l'arbre final (avec gestion des Exemptés/Byes).
* **Présences & Assiduité :** Système de pointage rapide ("Je suis là") pour le suivi des entraînements.
* **Espace Club :** Fil d'actualité, messagerie interne, et suivi du classement des joueurs.
* **Scoreboard Live :** Suivi des matchs en temps réel.

## 🛠️ Architecture Technique (Production)

L'application repose sur une architecture Cloud moderne séparant le client et l'API :

* **Frontend (Application Mobile) :**
    * Framework : React Native & Expo (TypeScript)
    * Distribution : Fichier exécutable autonome `.apk` généré via EAS Build.
* **Backend (API & Serveur) :**
    * Framework : Python / FastAPI
    * Hébergement : Render.com (Web Service)
* **Base de Données :**
    * Production : PostgreSQL (Hébergée sur Render)
    * Développement : SQLite (Local)

## 🚀 Installation & Lancement (Environnement de Développement)

Si vous souhaitez modifier le code ou exécuter l'application en local sur votre machine :

### 1. Backend (Serveur Local)
```bash
cd src/backend
# Création et activation de l'environnement virtuel (Optionnel mais recommandé)
python -m venv venv
source venv/Scripts/activate  # Sur Windows
# Installation des dépendances
pip install -r requirements.txt
# Lancement du serveur API
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (Application Mobile)
```bash
cd mobile-app
# Installation des dépendances Node
npm install
# Lancement de l'environnement Expo
npx expo start
```

Note pour les développeurs : Si vous testez en local, assurez-vous de modifier la variable API_URL dans les composants React Native pour cibler votre adresse IP locale (http://192.168.X.X:8000) au lieu de l'URL de production.

Projet développé par Gabriel MORIN.