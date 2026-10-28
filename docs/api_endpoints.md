# 🔌 Référence de l'API REST (FastAPI)

L'API est servie par **FastAPI** (`src/backend/api.py`). En local comme en production, une documentation interactive Swagger UI est générée automatiquement sur la route `/docs`.

---

## 1. Gestion des Joueurs & Présences

| Méthode | Route | Description | Corps de requête (JSON) / Paramètres |
| :--- | :--- | :--- | :--- |
| `GET` | `/joueurs` | Récupère la liste complète des joueurs du club triés par points. | Aucun |
| `POST` | `/joueurs` | Ajoute un nouveau joueur au club. | `{"nom": "MORIN", "prenom": "Gabriel", "points": 712, "club": "AS St Vincent-Bragny"}` |
| `DELETE`| `/joueurs/{id}` | Supprime un joueur de la base. | `id` (Path integer) |
| `GET` | `/presences` | Récupère l'historique des pointages et taux d'assiduité. | Aucun |
| `POST` | `/presences` | Enregistre la présence d'un joueur à la séance du jour. | `{"joueur_id": 1, "date": "2026-10-28", "statut": "present"}` |

---

## 2. Espace Club (Actualités, Événements & Messagerie)

| Méthode | Route | Description | Corps de requête (JSON) |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts` | Liste les annonces du club de la plus récente à la plus ancienne. | Aucun |
| `POST` | `/posts` | Publie une nouvelle annonce. | `{"auteur": "Bureau", "titre": "Tournoi interne", "contenu": "Inscriptions ouvertes", "type": "info"}` |
| `GET` | `/evenements` | Liste les prochains événements et entraînements. | Aucun |
| `POST` | `/evenements` | Crée un événement dans le calendrier. | `{"titre": "Entraînement dirigé", "date": "2026-11-03", "heure": "19:00", "type": "entrainement", "lieu": "Salle"}` |
| `GET` | `/messages` | Récupère les messages d'un canal donné. | Query param optionnel : `?poule=general` |
| `POST` | `/messages` | Envoie un message dans un salon. | `{"poule": "general", "auteur": "Gabriel", "texte": "Table 3 libre !"}` |

---

## 3. Gestion des Tournois

| Méthode | Route | Description | Détails Techniques |
| :--- | :--- | :--- | :--- |
| `GET` | `/tournois` | Liste tous les tournois et leur statut actuel. | Statuts : `inscription`, `poules`, `tableau`, `termine` |
| `POST` | `/tournois` | Crée un nouveau tournoi. | `{"nom": "Tournoi d'Automne", "nb_tables": 6}` |
| `POST` | `/tournois/{id}/inscrire` | Inscrit un membre du club ou un joueur invité. | Accepte `joueur_id` (membre) ou `nom_invite` + `points_depart` (externe) |
| `POST` | `/tournois/{id}/generer-poules` | Lance le *Snake Seeding* et génère tous les matchs de poules. | Bascule le statut du tournoi à `'poules'` |
| `GET` | `/tournois/{id}/poules` | Retourne la structure complète des poules, des joueurs et des matchs. | Regroupe les données par clé de poule (`A`, `B`...) et gère les libellés `"Exempté"` |
| `POST` | `/matchs/{id}/score` | Enregistre le score d'un match et le marque comme terminé. | `{"score1": 3, "score2": 1}` |
| `POST` | `/tournois/{id}/generer-tableau`| Qualifie les joueurs en sortie de poule et génère le tableau final. | Bascule le statut du tournoi à `'tableau'` |