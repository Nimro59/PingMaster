import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { api, errMsg } from '@/hooks/useApi';
import { byName, usePlayers } from '@/hooks/usePlayers';
import type { Joueur } from '@/types';
import { hap } from '@/utils/hap';

type Res = { details: { points_echanges: number } };

const fail = (title: string, msg: string) => {
  hap.err();
  Alert.alert(title, msg);
};

export function useMatchForm() {
  const { list, isLoad, isReady, err, reload } = usePlayers();
  const [win, setWin] = useState<Joueur | null>(null);
  const [lose, setLose] = useState<Joueur | null>(null);
  const [resetKey, setResetKey] = useState(false);
  const [isSend, setSend] = useState(false);

  const players = useMemo(() => [...list].sort(byName), [list]);

  useEffect(() => {
    if (err) Alert.alert('Erreur', 'Impossible de charger la liste des joueurs.');
  }, [err]);

  const reset = () => {
    setWin(null);
    setLose(null);
    setResetKey(k => !k);
    reload(true);
  };

  const onSub = async () => {
    if (!win || !lose) return fail('Incomplet', 'Sélectionne les deux joueurs dans la liste.');
    if (win.id === lose.id) return fail('Erreur', 'Un joueur ne peut pas jouer contre lui-même.');
    setSend(true);
    try {
      const { details } = await api.post<Res>('/match', {
        nom_gagnant: win.nom,
        prenom_gagnant: win.prenom,
        nom_perdant: lose.nom,
        prenom_perdant: lose.prenom,
      });
      Alert.alert('Match Validé ! ✅', `Points échangés : ${details.points_echanges}`, [
        { text: 'Nouveau match', onPress: reset },
      ]);
      hap.ok();
    } catch (e) {
      fail('Erreur', errMsg(e));
    } finally {
      setSend(false);
    }
  };

  return {
    players,
    isLoad: isLoad || !isReady,
    err,
    reload,
    win,
    lose,
    setWin,
    setLose,
    resetKey,
    isSend,
    onSub,
  };
}
