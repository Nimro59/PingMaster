import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import type { Joueur } from '@/types';

export const byName = (a: Joueur, b: Joueur) => a.nom.localeCompare(b.nom);
export const byPts = (a: Joueur, b: Joueur) => b.points - a.points;

export function usePlayers() {
  const { data, isLoad, isReady, err, run } = useApi<Joueur[]>('/joueurs', []);

  useFocusEffect(
    useCallback(() => {
      run(true);
    }, [run]),
  );

  return { list: data, isLoad, isReady, err, reload: run };
}
