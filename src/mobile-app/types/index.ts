import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type Joueur = {
  id: number;
  nom: string;
  prenom: string;
  points: number;
  club?: string;
  licence?: string;
};

export type Assiduite = {
  nom: string;
  total: number;
  present: number;
  pourcentage: number;
};

export type Post = {
  id: number;
  auteur: string;
  date: string;
  titre: string;
  contenu: string;
  type?: string;
};

export type Evenement = {
  id: number;
  titre: string;
  date: string;
  heure: string;
  type: string;
  lieu: string;
  description?: string | null;
};

export type Statut = 'inscription' | 'poules' | 'tableau';

export type Tournoi = {
  id: number;
  nom: string;
  date: string;
  status: Statut;
  nb_tables: number;
};

export type Participant = {
  id: number;
  nom: string;
  points: number;
};

export type Match = {
  id: number;
  j1: string;
  j2: string;
  s1: number;
  s2: number;
  termine: boolean | number;
  tour: string;
};

export type Poule = {
  joueurs: Participant[];
  matchs: Match[];
};

export type Poules = Record<string, Poule>;

export type Message = {
  id: number;
  auteur: string;
  contenu: string;
  date: string;
};

export type Live = {
  match_id: string;
  joueur1: string;
  joueur2: string;
  score1: number;
  score2: number;
  set1: number;
  set2: number;
  service: number;
};

export type LiveWtt = {
  id: string;
  joueur1: string;
  joueur2: string;
  score: string;
  statut: string;
};

export type Historique = {
  stats: {
    total_matchs: number;
    victoires: number;
    defaites: number;
    ratio: number;
    best_perf: number;
    worst_contre: number;
  };
  courbe: { match: string; points: number }[];
};

export type Club = {
  id: number;
  nom: string;
  role: 'admin' | 'joueur';
};
