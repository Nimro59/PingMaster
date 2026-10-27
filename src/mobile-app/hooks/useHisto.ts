import { useEffect, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { useRefresh } from '@/hooks/useStats';
import type { Historique } from '@/types';

export function useHisto(id?: string) {
  const { data: histo, isLoad, isReady, err, run } = useApi<Historique | null>(
    id ? `/joueur/${id}/historique` : null,
    null,
  );
  const { isRefresh, refresh } = useRefresh(() => run(true));

  useEffect(() => {
    run(true);
  }, [run]);

  useEffect(() => {
    if (err) console.error(err);
  }, [err]);

  const pts = useMemo(() => histo?.courbe.map(c => c.points) ?? [], [histo]);
  const cur = pts.length ? pts[pts.length - 1] : null;
  const delta = cur !== null && pts.length > 1 ? Math.round(cur - pts[0]) : 0;

  return {
    histo,
    pts,
    cur,
    delta,
    isLoad: isLoad || !isReady,
    err,
    retry: () => run(),
    isRefresh,
    refresh,
  };
}
