import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import type { Tone } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { byPts, usePlayers } from '@/hooks/usePlayers';
import type { Assiduite, Joueur } from '@/types';

export type Tri = 'pts' | 'assid';

type Merged = Joueur & { assid: Assiduite | null };

export type Ranked = Merged & { rank: number | null };

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const byAssid = (a: Merged, b: Merged) =>
  (b.assid?.pourcentage ?? -1) - (a.assid?.pourcentage ?? -1) || byPts(a, b);

export const assidTone = (pct: number): Tone => (pct > 80 ? 'success' : pct > 50 ? 'live' : 'danger');

export function useRefresh(job: () => Promise<unknown>) {
  const [isRefresh, setRefresh] = useState(false);

  const refresh = async () => {
    setRefresh(true);
    try {
      await job();
    } finally {
      setRefresh(false);
    }
  };

  return { isRefresh, refresh };
}

export function useStats(tri: Tri, q: string) {
  const { list, isReady, err, reload } = usePlayers();
  const { data: assids, isReady: isAssidReady, run } = useApi<Assiduite[]>('/stats/assiduite', []);
  const { isRefresh, refresh } = useRefresh(() => Promise.all([reload(true), run(true)]));

  useFocusEffect(
    useCallback(() => {
      run(true);
    }, [run]),
  );

  const ranked = useMemo<Ranked[]>(() => {
    const byNom = new Map<string, Assiduite>(assids.map(a => [a.nom, a]));
    return list
      .map(j => ({ ...j, assid: byNom.get(`${j.prenom} ${j.nom}`) ?? null }))
      .sort(tri === 'pts' ? byPts : byAssid)
      .map((p, i) => ({ ...p, rank: tri === 'assid' && !p.assid ? null : i + 1 }));
  }, [list, assids, tri]);

  const rows = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return ranked;
    return ranked.filter(p => {
      const key = norm(`${p.nom} ${p.prenom}`);
      return words.every(w => key.includes(w));
    });
  }, [ranked, q]);

  const top = useMemo(() => ranked.slice(0, 3).filter(p => p.rank), [ranked]);

  const avg = assids.length ? Math.round(assids.reduce((t, a) => t + a.pourcentage, 0) / assids.length) : null;

  return {
    rows,
    top,
    total: list.length,
    avg,
    isReady: isReady && isAssidReady,
    err,
    isRefresh,
    refresh,
  };
}
