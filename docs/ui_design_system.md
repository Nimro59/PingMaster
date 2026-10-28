# 🎨 Design System & Architecture Frontend

L'application mobile (`src/mobile-app`) est construite avec **React Native**, **Expo Router** et **TypeScript**. Elle adopte un thème sombre natif (*Dark Mode Sportif*) pensé pour offrir un contraste élevé dans les gymnases et permettre une saisie à une main en bord de table.

---

## 1. Tokens de Couleurs (`constants/theme.ts`)

| Token | Code Hex / RGBA | Rôle dans l'interface |
| :--- | :--- | :--- |
| `bgMain` | `#090D16` | Arrière-plan principal des écrans |
| `bgCard` | `#121826` | Surface des cartes (poules, annonces, lignes de joueurs) |
| `bgElevated` | `#1C2536` | Surface surélevée (modales de score, champs de saisie, en-têtes) |
| `border` | `#263248` | Bordure fine (`1px`) délimitant les cartes sans alourdir l'écran |
| `primary` | `#3B82F6` | Bleu compétition — Actions principales, onglets sélectionnés |
| `primaryMuted`| `rgba(59, 130, 246, 0.15)`| Arrière-plan des badges actifs et sélections |
| `accent` | `#06B6D4` | Cyan — Indicateurs statistiques et métriques secondaires |
| `live` | `#F59E0B` | Ambre — Matchs en cours et alertes de compétition |
| `success` | `#10B981` | Vert — Victoire, match validé, pointage d'entraînement confirmé |
| `danger` | `#EF4444` | Rouge — Défaite, suppression, erreur de connexion |
| `textMain` | `#F8FAFC` | Texte principal à fort contraste |
| `textSub` | `#94A3B8` | Texte secondaire (sous-titres, dates, clubs) |
| `textMuted` | `#64748B` | Texte désactivé, mentions `"Exempté"` |

### Règles Typographiques
* **Alignement tabulaire :** Tous les composants affichant des scores, des classements ou des points utilisent `fontVariant: ['tabular-nums']` afin que les chiffres occupent exactement la même largeur.
* **Échelle d'espacement :** Basée sur une grille stricte de 4px (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `xxl: 32`).

---

## 2. Architecture des Composants

### Briques Atomiques (`components/ui/`)
* **`Btn.tsx`** : Bouton générique supportant les variantes `primary`, `secondary`, `ghost`, `danger`, l'état `loading` (`ActivityIndicator`) et le retour haptique léger.
* **`Card.tsx`** : Conteneur standardisé avec `bgCard`, rayon `12px` et bordure `#263248`.
* **`Badge.tsx`** : Pastille compacte pour afficher les points, les lettres de poules ou l'état d'une rencontre.
* **`Input.tsx`** : Champ de texte avec changement de bordure dynamique au focus (`borderFocus`).
* **`Segmented.tsx`** : Sélecteur horizontal fluide permettant de basculer entre plusieurs vues au sein d'un même écran sans rechargement.
* **`Empty.tsx`** : Composant d'état vide illustré lorsque aucune donnée n'est disponible.

### Composants Métier Tournoi (`components/tournoi/`)
* **`PoolCard.tsx`** : Affiche le tableau récapitulatif d'une poule (joueurs, points initiaux) suivi de la liste des rencontres.
* **`MatchRow.tsx`** : Ligne de rencontre interactive mettant en évidence le vainqueur en vert (`success`) dès que le match est terminé.
* **`BracketView.tsx`** : Vue à défilement horizontal affichant les colonnes de l'arbre final (`1/8`, `1/4`, `1/2`, `Finale`) et grisant automatiquement les lignes `"Exempté"`.
* **`ScoreModal.tsx`** : Modale d'arbitrage rapide déclenchant une vibration (`expo-haptics`) à la validation du score.

### Composants Métier Club (`components/club/`)
* **`PostCard.tsx`** : Carte d'actualité avec badge de catégorie et horodatage.
* **`EventRow.tsx`** : Carte d'événement intégrant le lieu, l'horaire et l'action de pointage.
* **`PlayerRow.tsx`** : Ligne optimisée pour `FlatList` affichant le rang, l'identité du joueur et son évolution de points.

---

## 3. Procédures de Build & Mise à Jour (EAS)

### Configuration Babel & Hermes (`babel.config.js`)
Pour garantir la compilation du bundle par le moteur **Hermes** sur Android, les plugins de transformation des classes et propriétés privées sont alignés en mode `loose: true` :
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }]
    ],
  };
};