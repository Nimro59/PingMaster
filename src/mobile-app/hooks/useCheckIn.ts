import { useState } from 'react';
import { Alert } from 'react-native';
import { api } from '@/hooks/useApi';
import type { Joueur } from '@/types';
import { today } from '@/utils/fmt';
import { hap } from '@/utils/hap';

export function useCheckIn(me: number | null, setMe: (id: number) => Promise<void>) {
  const [day, setDay] = useState<string | null>(null);
  const [isPick, setPick] = useState(false);

  const send = async (id: number) => {
    const date = today();
    setDay(date);
    hap.ok();
    try {
      await api.post('/presences', { joueur_id: id, date, statut: 'present' });
    } catch {
      setDay(null);
      hap.err();
      Alert.alert('Erreur', 'Impossible de valider la présence.');
    }
  };

  const checkIn = () => {
    if (me) send(me);
    else setPick(true);
  };

  const pick = async ({ id }: Joueur) => {
    await setMe(id);
    setPick(false);
    send(id);
  };

  return { isDone: day === today(), isPick, checkIn, pick, closePick: () => setPick(false) };
}
