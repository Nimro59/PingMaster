# Spécifications de Refonte UI/UX — PingMaster (React Native / Expo)

## 1. Objectif de la Mission
Refondre intégralement l'interface utilisateur de l'application mobile située dans `src/mobile-app` pour passer d'un prototype fonctionnel à un design de production haut de gamme, fluide et moderne (style application sportive professionnelle, thème sombre natif).

**Contrainte absolue :** Conserver 100 % de la logique métier existante, des routes API (FastAPI sur Render) et de la structure des données. Seuls le rendu visuel, l'ergonomie et le découpage des composants front-end doivent être réécrits.

---

## 2. Règles Strictes d'Écriture de Code (Directives Agent)
1. **Zéro commentaire superflu :** Ne mets aucun commentaire générique ou descriptif évident (ex: `// Fonction pour récupérer les joueurs`, `// Rendu du header`). N'ajoute un commentaire que si une logique algorithmique complexe l'exige.
2. **Nommage court et cohérent :** Utilise des noms de variables, d'états et de fonctions concis, logiques et humains (ex: `fetchPools`, `updScore`, `isLoad`, `selTournoi`, `onSub` au lieu de `handleTournamentScoreUpdateSubmission`).
3. **Code factorisé et intelligent :** Évite la duplication. Utilise des fonctions courtes, le chaînage optionnel, la déstructuration et des structures conditionnelles propres.
4. **Séparation UI / Logique :** Extrais la logique lourde et les appels `fetch` répétitifs dans des hooks dédiés (`hooks/`) pour garder les fichiers d'écrans (`.tsx`) lisibles et centrés sur l'interface.
5. **Typage strict :** Maintiens un code TypeScript propre sans erreurs de compilation (`npx tsc --noEmit` doit passer sans erreur).
6. **Dépendances natives :** Utilise uniquement les bibliothèques déjà présentes dans le `package.json` (`expo-haptics`, `react-native-reanimated`, `react-native-svg`, `@expo/vector-icons`, `react-native-safe-area-context`).

---

## 3. Direction Artistique & Design System (`constants/theme.ts`)

### Palette de Couleurs (Dark Mode Sportif)
* **Backgrounds :**
  * `bgMain`: `#090D16` (Fond d'écran principal, très profond)
  * `bgCard`: `#121826` (Conteneurs, cartes de matchs, listes)
  * `bgElevated`: `#1C2536` (Modales, inputs actifs, en-têtes de poules)
* **Bordures & Séparateurs :**
  * `border`: `#263248` (Bordure fine `1px` sur les cartes pour les détacher du fond)
  * `borderFocus`: `#3B82F6`
* **Couleurs d'Accentuation :**
  * `primary`: `#3B82F6` (Bleu compétition — boutons principaux, onglets actifs)
  * `primaryMuted`: `rgba(59, 130, 246, 0.15)` (Fonds de badges, états sélectionnés)
  * `accent`: `#06B6D4` (Cyan — indicateurs secondaires, statistiques)
  * `live`: `#F59E0B` (Ambre — matchs en cours, alertes tournois)
* **États :**
  * `success`: `#10B981` (Victoire, présence validée, match terminé)
  * `danger`: `#EF4444` (Défaite, suppression, erreur réseau)
* **Typographie :**
  * `textMain`: `#F8FAFC`
  * `textSub`: `#94A3B8`
  * `textMuted`: `#64748B`

### Typographie & Métriques
* **Scores & Classements :** Toujours appliquer `fontVariant: ['tabular-nums']` sur les scores, points FFTT et classements pour un alignement vertical strict.
* **Hiérarchie :**
  * Titre d'écran (`h1`) : `24px`, `fontWeight: '800'`, `letterSpacing: -0.5`
  * Titre de section (`h2`) : `18px`, `fontWeight: '700'`
  * Corps / Nom de joueur (`body`) : `15px`, `fontWeight: '600'`
  * Label / Badge (`caption`) : `12px`, `fontWeight: '600'`, `textTransform: 'uppercase'`, `letterSpacing: 0.5`
* **Espacements & Formes :**
  * Grille en multiples de 4 (`sp: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }`).
  * Rayons (`rad: { sm: 8, md: 12, lg: 16, full: 999 }`).

---

## 4. Nouvelle Arborescence Cible (`src/mobile-app`)

```
src/mobile-app/
├── constants/
│   ├── theme.ts               # Tokens de couleurs, espacements, typographie, styles globaux
│   └── config.ts              # Configuration API_URL centralisée
├── hooks/
│   ├── useApi.ts              # Wrapper fetch générique avec gestion d'état (loading, error)
│   └── useTournoi.ts          # Logique métier et appels API propres aux tournois
├── components/
│   ├── ui/                    # Briques atomiques réutilisables
│   │   ├── Btn.tsx            # Bouton (variantes: primary, secondary, ghost, danger + loading)
│   │   ├── Card.tsx           # Conteneur standard avec bordure subtile et padding
│   │   ├── Badge.tsx          # Pastille d'état (En cours, Terminé, Poule A, Points)
│   │   ├── Input.tsx          # Champ de saisie stylisé avec état focus
│   │   ├── Segmented.tsx      # Sélecteur d'onglets interne fluide (ex: Poules / Tableau / Inscrits)
│   │   └── Empty.tsx          # État vide propre avec icône et message
│   ├── tournoi/               # Composants métier Tournoi
│   │   ├── PoolCard.tsx       # Affichage d'une poule (classement + liste des matchs)
│   │   ├── MatchRow.tsx       # Ligne de match compacte (J1 vs J2, scores tabulaires, statut)
│   │   ├── BracketView.tsx    # Affichage horizontal propre de l'arbre à élimination directe
│   │   └── ScoreModal.tsx     # Modale ergonomique de saisie rapide de score avec Haptics
│   └── club/                  # Composants métier Club & Joueurs
│       ├── PostCard.tsx       # Carte d'annonce / actualité
│       ├── EventRow.tsx       # Carte d'événement avec bouton de pointage rapide
│       └── PlayerRow.tsx      # Ligne joueur avec rang, nom, club et badge de points
└── app/
    ├── _layout.tsx            # Configuration globale, StatusBar light, thème sombre
    ├── modal.tsx              # Modales secondaires stylisées
    └── (tabs)/
        ├── _layout.tsx        # TabBar sombre épurée, icônes nettes, hauteur optimisée
        ├── index.tsx          # Accueil : Pointage rapide, prochain événement, fil d'actu
        ├── tournoi.tsx        # Écran Tournoi restructuré via Segmented control et sous-composants
        ├── stats.tsx          # Classement des joueurs, filtres rapides, statistiques d'assiduité
        └── settings.tsx       # Paramètres, gestion club et actions d'administration 
```        

## 5. Spécifications Écran par Écran

* **A. Navigation (app/(tabs)/_layout.tsx)**
 * Barre d'onglets basse avec fond #090D16 et bordure supérieure #1E293B (1px).

 * Masquer les headers natifs disgracieux au profit d'un en-tête intégré propre dans chaque écran utilisant SafeAreaView.

* **B. Accueil & Club (app/(tabs)/index.tsx)**
 * Header : Nom du club, indicateur d'état de connexion au serveur (petit point vert/orange si Render se réveille).

 * Action rapide : Carte mise en avant en haut pour le pointage d'entraînement ("Je suis présent") avec retour haptique (expo-haptics) et changement d'état visuel immédiat.

 * Fil d'actualité & Événements : Bascule rapide ou sections distinctes utilisant PostCard et EventRow. Bouton flottant (FAB) ou bouton d'en-tête discret pour créer une annonce/événement.

* **C. Tournois (app/(tabs)/tournoi.tsx) — Priorité Haute**
 * Remplacer l'empilement vertical confus par une navigation interne via Segmented.tsx : 1. Inscrits | 2. Poules | 3. Tableau Final.

 * Vue Inscrits : Barre d'ajout rapide (membre du club ou invité externe) + liste numérotée avec points de départ et bouton de lancement des poules fixe en bas.

 * Vue Poules : Cartes distinctes par poule (PoolCard.tsx) affichant un mini-tableau des joueurs et la liste des rencontres (MatchRow.tsx). Cliquer sur un match ouvre ScoreModal.tsx.

 * Vue Tableau Final (BracketView.tsx) : Scroll horizontal fluide par tour (1/8, 1/4, 1/2, Finale). Gérer élégamment l'affichage des joueurs Exempté (texte grisé #64748B, pas d'interaction).

 * Saisie des scores (ScoreModal.tsx) : Interface pensée pour être utilisée d'une seule main au bord de la table (boutons rapides ou pavé numérique net, mise en évidence automatique du gagnant).

* **D. Statistiques & Joueurs (app/(tabs)/stats.tsx)**
 * Barre de recherche instantanée en haut pour filtrer les joueurs.

 * Podium ou mise en avant des 3 premiers du club en haut de liste.

 * Liste optimisée (FlatList) utilisant PlayerRow.tsx avec affichage clair des points et du taux de présence.

## 6. Plan d'Exécution Séquentiel (Instructions de travail)
* Exécute cette refonte dans cet ordre précis :

 * Fondations : Crée constants/config.ts (pour centraliser API_URL actuellement dispersé dans les fichiers) et constants/theme.ts.

 * UI Kit : Crée tous les composants atomiques dans components/ui/.

 * Navigation : Mets à jour app/_layout.tsx et app/(tabs)/_layout.tsx.

 * Refonte Tournoi : Crée les sous-composants dans components/tournoi/ puis réécris app/(tabs)/tournoi.tsx en branchant les routes API existantes.

 * Refonte Club, Stats & Settings : Crée components/club/ puis mets à jour index.tsx, stats.tsx, settings.tsx et modal.tsx.

 * Validation : Vérifie que toutes les URLs pointent vers config.ts, lance npx tsc --noEmit et corrige la moindre alerte de typage ou d'import manquant.