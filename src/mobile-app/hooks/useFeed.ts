import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { api, useApi } from '@/hooks/useApi';
import type { Evenement, Post } from '@/types';
import { parseDay } from '@/utils/fmt';
import { hap } from '@/utils/hap';

export const EVT = [
  { key: 'entrainement', label: 'Entraînement', tone: 'primary' },
  { key: 'match', label: 'Match', tone: 'live' },
  { key: 'reunion', label: 'Réunion', tone: 'accent' },
] as const;

export type EvtKey = (typeof EVT)[number]['key'];
export type Agenda = Evenement & { at: Date | null; isPast: boolean };
export type NewEvt = Pick<Evenement, 'titre' | 'date' | 'heure'> & { type: EvtKey };

export const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const evtOf = (type?: string | null) =>
  EVT.find(e => e.key === fold(type ?? '')) ?? { label: type || 'Autre', tone: 'muted' as const };

const time = (e: Agenda) => e.at?.getTime() ?? 0;

const toAgenda = (list: Evenement[]): Agenda[] => {
  const now = Date.now();
  const rows = list.map(e => {
    const at = parseDay(e.date, e.heure);
    return { ...e, at, isPast: !at || at.getTime() < now };
  });
  return [
    ...rows.filter(e => !e.isPast).sort((a, b) => time(a) - time(b)),
    ...rows.filter(e => e.isPast).sort((a, b) => time(b) - time(a)),
  ];
};

export function useFeed() {
  const feed = useApi<Post[]>('/vestiaire', []);
  const cal = useApi<Evenement[]>('/evenements', []);
  const { run: getFeed } = feed;
  const { run: getCal } = cal;

  const reload = useCallback(
    (silent = false) => Promise.all([getFeed(silent), getCal(silent)]),
    [getFeed, getCal],
  );

  useFocusEffect(
    useCallback(() => {
      reload(true);
    }, [reload]),
  );

  const agenda = useMemo(() => toAgenda(cal.data), [cal.data]);

  return {
    posts: feed.data,
    agenda,
    next: agenda.find(e => !e.isPast),
    isRefresh: feed.isLoad || cal.isLoad,
    status: {
      feed: { isReady: feed.isReady, err: feed.err },
      agenda: { isReady: cal.isReady, err: cal.err },
    },
    reload,
  };
}

export function usePublish() {
  const [isLoad, setLoad] = useState(false);

  const send = async (path: string, body: object, fail: string) => {
    setLoad(true);
    try {
      await api.post(path, body);
      hap.ok();
      return true;
    } catch {
      hap.err();
      Alert.alert('Erreur', fail);
      return false;
    } finally {
      setLoad(false);
    }
  };

  const addPost = async (titre: string, contenu: string) => {
    if (!titre || !contenu) return false;
    return send('/vestiaire', { auteur: 'Coach', titre, contenu, type: 'info' }, 'Impossible de publier');
  };

  const addEvent = async ({ titre, date, heure, type }: NewEvt) => {
    if (!titre || !date) return false;
    return send('/evenements', { titre, date, heure, type, lieu: 'Salle' }, "Impossible de créer l'événement");
  };

  return { isLoad, addPost, addEvent };
}
