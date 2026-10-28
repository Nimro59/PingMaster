# 🏆 Algorithmes de Gestion de Tournoi

Ce document détaille les règles de gestion sportive et les algorithmes implémentés dans `src/backend/api.py` pour automatiser le déroulement d'une compétition conformément aux usages de la FFTT.

---

## 1. Répartition en Poules : Méthode du Serpentin (*Snake Seeding*)

### Objectif
Éviter que les meilleurs joueurs du tournoi ne se retrouvent dans la même poule dès le premier tour et garantir une homogénéité de niveau entre toutes les poules.

### Fonctionnement
1. **Tri initial :** Tous les inscrits (`participants_tournoi`) sont triés par ordre décroissant selon leur colonne `points_depart`.
2. **Calcul du nombre de poules :** Déterminé dynamiquement en fonction du nombre d'inscrits et de la capacité des tables pour obtenir des poules de 3 ou 4 joueurs.
3. **Distribution aller-retour :**
   * Au rang impair (1er chapeau, 3e chapeau...), les joueurs sont distribués de la poule **A vers la dernière poule**.
   * Au rang pair (2e chapeau, 4e chapeau...), l'ordre d'attribution est inversé (de la **dernière poule vers la poule A**).

### Exemple pour 12 joueurs répartis dans 3 poules (A, B, C)
| Chapeau | Poule A | Poule B | Poule C | Sens de distribution |
| :--- | :---: | :---: | :---: | :--- |
| **Chapeau 1** | Tête de série n°1 | Tête de série n°2 | Tête de série n°3 | $\rightarrow$ (A, B, C) |
| **Chapeau 2** | Tête de série n°6 | Tête de série n°5 | Tête de série n°4 | $\leftarrow$ (C, B, A) |
| **Chapeau 3** | Tête de série n°7 | Tête de série n°8 | Tête de série n°9 | $\rightarrow$ (A, B, C) |
| **Chapeau 4** | Tête de série n°12| Tête de série n°11| Tête de série n°10| $\leftarrow$ (C, B, A) |

---

## 2. Phase de Poules : Génération *Round-Robin*

Dans chaque poule de $N$ joueurs, chaque participant affronte tous les autres une seule fois, soit un total de :
$$\text{Nombre de matchs} = \frac{N(N - 1)}{2}$$

* **Poule de 3 joueurs :** 3 rencontres.
* **Poule de 4 joueurs :** 6 rencontres.

À la validation de chaque score (`termine = True`), le classement provisoire de la poule est calculé selon :
1. Le nombre de victoires.
2. Le différentiel de manches/points ($\text{score marqué} - \text{score encaissé}$).
3. Les points de départ en cas d'égalité parfaite.

---

## 3. Phase Finale : Tableau à Élimination Directe & Gestion des Exemptés (*Byes*)

### Calcul de la taille du tableau
Un arbre à élimination directe exige un nombre de places égal à une puissance de 2 ($2^k \in \{4, 8, 16, 32, 64\}$).
Si le nombre de joueurs qualifiés $Q$ n'est pas une puissance de 2, l'algorithme calcule la puissance de 2 immédiatement supérieure :
$$T = 2^{\lceil \log_2(Q) \rceil}$$

### Attribution des Exemptés (*Byes*)
Le nombre d'exemptés au premier tour du tableau est donné par :
$$B = T - Q$$

* Dans la base de données (`matchs_tournoi`), un joueur exempté est représenté par une valeur `NULL` sur `joueur2_id` (ou `joueur1_id`).
* Lors de la lecture via la route `GET /tournois/{id}/poules`, le backend détecte `j1_id is None` ou `j2_id is None` et substitue automatiquement le libellé `"Exempté"`.
* Le match est marqué comme terminé d'office afin de qualifier directement la tête de série pour le tour suivant (`1/4`, `1/2`, `Finale`).