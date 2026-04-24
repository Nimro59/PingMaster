# PingMaster 🏓

> Application mobile de gestion de club de Tennis de Table et d'analyse statistique de performance.

PingMaster est une solution complète permettant aux joueurs d'un club d'enregistrer leurs matchs d'entraînement, de calculer automatiquement leur évolution de points (basé sur l'algorithme officiel FFTT) et de visualiser des statistiques avancées type "Moneyball".

## 🚀 Fonctionnalités Clés

- **Système de Classement Dynamique** : Calcul automatique des points gagnés/perdus après chaque match selon le barème officiel.
- **Analyse de Données (Moneyball)** :
  - Graphiques d'évolution de performance.
  - Statistiques détaillées : Taux de victoire, "Best Perf", Némésis.
- **Gestion des Joueurs** : Base de données importée avec les licenciés réels du club.
- **Matchmaking Intelligent** : Saisie rapide des scores avec recherche automatique de l'adversaire.

## 🛠 Stack Technique

**Backend & Data**
- **Langage** : Python 3.14.4
- **Base de Données** : SQLite (Structure relationnelle optimisée pour les historiques de matchs).
- **Architecture** : API REST pour la communication avec l'application mobile.

**Frontend (Mobile)**
- **Framework** : React Native / Expo
- **UI/UX** : Interface moderne avec navigation fluide et visualisation de données graphiques.

## 📦 Installation & Démarrage

### Pré-requis
- Python 3.10+
- Node.js & npm

### Lancer le Serveur (Backend)
```bash
cd src/backend
pip install -r requirements.txt
python main.py
```
### Lancer l'Application (Mobile)
```
cd src/mobile-app
npm install
npx expo start
```
