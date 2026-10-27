import { usePreventRemove } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { POLL } from '@/constants/config';
import { api, errMsg } from '@/hooks/useApi';
import type { Live, LiveWtt } from '@/types';
import { hap } from '@/utils/hap';

type Lives = { club: Live[]; wtt: LiveWtt[] };
type Side = 1 | 2;
type Board = { s1: number; s2: number; st1: number; st2: number; srv: number };

const ZERO: Board = { s1: 0, s2: 0, st1: 0, st2: 0, srv: 1 };

export function useLive() {
  const [lives, setLives] = useState<Live[]>([]);
  const [wtt, setWtt] = useState<LiveWtt[]>([]);
  const [isReady, setReady] = useState(false);
  const [isRefresh, setRefresh] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isArb, setArb] = useState(false);
  const [j1, setJ1] = useState('');
  const [j2, setJ2] = useState('');
  const [matchId, setMatchId] = useState('');
  const [board, setBoard] = useState(ZERO);

  const fetchLives = useCallback(async () => {
    try {
      const data = await api.get<Lives>('/lives');
      setLives(data.club);
      setWtt(data.wtt);
      setErr(null);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setReady(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isArb) return;
      fetchLives();
      const id = setInterval(fetchLives, POLL.live);
      return () => clearInterval(id);
    }, [isArb, fetchLives]),
  );

  const refresh = async () => {
    setRefresh(true);
    await fetchLives();
    setRefresh(false);
  };

  const push = (id: string, { s1, s2, st1, st2, srv }: Board) => {
    api
      .post('/lives/update', {
        match_id: id,
        joueur1: j1,
        joueur2: j2,
        score1: s1,
        score2: s2,
        set1: st1,
        set2: st2,
        service: srv,
      })
      .catch(() => {});
  };

  const apply = (next: Board) => {
    setBoard(next);
    push(matchId, next);
  };

  const canStart = !!j1 && !!j2;

  const start = () => {
    if (!canStart) return false;
    const id = Date.now().toString();
    setMatchId(id);
    setBoard(ZERO);
    setArb(true);
    push(id, ZERO);
    hap.ok();
    return true;
  };

  const point = (p: Side, d: number) => {
    const s1 = p === 1 ? Math.max(0, board.s1 + d) : board.s1;
    const s2 = p === 2 ? Math.max(0, board.s2 + d) : board.s2;
    const tot = s1 + s2;
    const srv = tot % 2 === 0 && tot !== 0 && d > 0 ? (board.srv === 1 ? 2 : 1) : board.srv;
    if (d > 0) hap.hit();
    else hap.tap();
    apply({ ...board, s1, s2, srv });
  };

  const addSet = (p: Side) => {
    hap.ok();
    apply({ ...board, s1: 0, s2: 0, st1: board.st1 + (p === 1 ? 1 : 0), st2: board.st2 + (p === 2 ? 1 : 0) });
  };

  const end = async () => {
    try {
      await api.del(`/lives/${matchId}`);
      hap.ok();
      setArb(false);
      setBoard(ZERO);
    } catch (e) {
      hap.err();
      Alert.alert('Erreur', errMsg(e));
    }
  };

  const stop = () =>
    Alert.alert('Fin du match', 'Arrêter la diffusion ?', [{ text: 'Non' }, { text: 'Oui, Arrêter', onPress: end }]);

  usePreventRemove(isArb, stop);

  return {
    lives,
    wtt,
    isReady,
    err,
    isRefresh,
    refresh,
    isArb,
    j1,
    j2,
    setJ1,
    setJ2,
    canStart,
    start,
    board,
    point,
    addSet,
    stop,
  };
}
