import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { api, errMsg, useApi } from '@/hooks/useApi';
import { byName } from '@/hooks/usePlayers';
import type { Joueur, Match, Participant, Poule, Poules, Statut, Tournoi } from '@/types';
import { hap } from '@/utils/hap';

export type Tab = 'inscrits' | 'poules' | 'tableau';

type Round = { tour: string; matchs: Match[] };
type Rank = Participant & { j: number; v: number };
type Act = 'create' | 'add' | 'gen' | 'close' | 'score';
type Entry = { joueur_id: number; points: number } | { nom_invite: string; points: number };

export const BYE = 'Exempté';
const TAB_OF: Record<Statut, Tab> = { inscription: 'inscrits', poules: 'poules', tableau: 'tableau' };
const ROUNDS = ['1/8', '1/4', '1/2', 'Finale'];

export const isDone = (m: Match) => !!m.termine;
export const hasBye = (m: Match) => m.j1 === BYE || m.j2 === BYE;
export const winSide = (m: Match) => (isDone(m) ? Math.sign(m.s1 - m.s2) : 0);

export function winnerOf(m: Match) {
  const w = winSide(m);
  if (!w) return null;
  return w > 0 ? m.j1 : m.j2;
}

export const played = (matchs: Match[]) => matchs.filter(isDone).length;
export const poolKeys = (poules: Poules) => Object.keys(poules).filter(k => k !== 'Tableau').sort();
export const poolMatchs = (poules: Poules) => poolKeys(poules).flatMap(k => poules[k].matchs);

export const tours = (matchs: Match[]) =>
  [...matchs]
    .sort((a, b) => parseInt(a.tour) - parseInt(b.tour))
    .reduce<Round[]>((acc, m) => {
      const last = acc[acc.length - 1];
      if (last?.tour === m.tour) last.matchs.push(m);
      else acc.push({ tour: m.tour, matchs: [m] });
      return acc;
    }, []);

export const rounds = (matchs: Match[]): Round[] =>
  ROUNDS.map(tour => ({ tour, matchs: matchs.filter(m => m.tour === tour) })).filter(r => r.matchs.length > 0);

export function standings({ joueurs, matchs }: Poule): Rank[] {
  const done = matchs.filter(isDone);
  return joueurs
    .map((p, i) => {
      const mine = done.filter(m => m.j1 === p.nom || m.j2 === p.nom);
      return { ...p, j: mine.length, v: mine.filter(m => winnerOf(m) === p.nom).length, i };
    })
    .sort((a, b) => b.v - a.v || a.i - b.i);
}

export function freePlayers(list: Joueur[], parts: Participant[]) {
  const taken = new Set(parts.map(p => p.nom));
  return list.filter(j => !taken.has(`${j.prenom} ${j.nom}`)).sort(byName);
}

const fail = (msg: string) => {
  hap.err();
  Alert.alert('Erreur', msg);
  return false;
};

const ask = (title: string, msg: string, ok: string, onOk: () => void) =>
  Alert.alert(title, msg, [
    { text: 'Annuler' },
    {
      text: ok,
      onPress: () => {
        hap.hit();
        onOk();
      },
    },
  ]);

function useAct() {
  const [busy, setBusy] = useState<Act | null>(null);

  const act = async (kind: Act, fn: () => Promise<string | void>) => {
    setBusy(kind);
    try {
      const msg = await fn();
      if (msg) return fail(msg);
      hap.ok();
      return true;
    } catch (e) {
      return fail(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  return { busy, act };
}

export function useTournois() {
  const { data: list, isLoad, isReady, err, run } = useApi<Tournoi[]>('/tournois', []);
  const { busy, act } = useAct();

  useFocusEffect(
    useCallback(() => {
      run(true);
    }, [run]),
  );

  const create = async (nom: string, nbTables: string) =>
    !!nom &&
    act('create', async () => {
      await api.post('/tournois', { nom, nb_tables: parseInt(nbTables) });
      run(true);
    });

  return { list, isLoad, isReady, err, refresh: run, create, isSaving: busy === 'create' };
}

export function useTournoi(init: Tournoi) {
  const { id } = init;
  const [status, setStatus] = useState(init.status);
  const [tab, setTab] = useState(TAB_OF[init.status]);
  const [isRefresh, setRefresh] = useState(false);
  const parts = useApi<Participant[] | null>(`/tournois/${id}/participants`, null);
  const pools = useApi<Poules | null>(`/tournois/${id}/poules`, null);
  const { busy, act } = useAct();
  const { run: fetchParts } = parts;
  const { run: fetchPools } = pools;

  const fetchTab = useCallback(
    (view: Tab, silent = false) => (view === 'inscrits' ? fetchParts(silent) : fetchPools(silent)),
    [fetchParts, fetchPools],
  );

  useEffect(() => {
    fetchTab(TAB_OF[init.status]);
  }, [fetchTab, init.status]);

  const show = (view: Tab) => {
    setTab(view);
    fetchTab(view, !!(view === 'inscrits' ? parts.data : pools.data));
  };

  const reload = async () => {
    setRefresh(true);
    await fetchTab(tab, true);
    setRefresh(false);
  };

  const advance = (next: Statut) => {
    setStatus(next);
    setTab(TAB_OF[next]);
    fetchPools();
  };

  const register = (entry: Entry) =>
    act('add', async () => {
      await api.post('/tournois/inscription', { tournoi_id: id, ...entry });
      await fetchParts(true);
    });

  const addGuest = async (nom: string, pts: string) =>
    !!nom && register({ nom_invite: nom, points: parseInt(pts) });

  const addMember = (j: Joueur) => register({ joueur_id: j.id, points: Math.round(j.points) });

  const launch = () =>
    ask('Lancement', 'Verrouiller les inscriptions et générer les poules ?', 'Générer', () =>
      act('gen', async () => {
        await api.post(`/tournois/${id}/generation`);
        advance('poules');
      }),
    );

  const closePools = () =>
    ask('Fin des Poules', "Générer l'arbre final ?", 'Générer Tableau', () =>
      act('close', async () => {
        const res = await api.post<{ error?: string }>(`/tournois/${id}/cloture-poules`);
        if (res?.error) return res.error;
        advance('tableau');
      }),
    );

  const updScore = (match_id: number, score1: number, score2: number) =>
    act('score', async () => {
      await api.post('/tournois/match', { match_id, score1, score2 });
      fetchPools(true);
    });

  const shown = tab === 'inscrits' ? parts : pools;

  return {
    status,
    tab,
    show,
    parts: parts.data,
    poules: pools.data,
    isLoad: shown.isLoad,
    err: shown.err,
    retry: () => fetchTab(tab),
    isRefresh,
    reload,
    busy,
    addGuest,
    addMember,
    launch,
    closePools,
    updScore,
  };
}
