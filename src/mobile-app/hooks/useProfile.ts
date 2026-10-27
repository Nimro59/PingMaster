import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import type { Club } from '@/types';

const DEMO: Club[] = [
  { id: 1, nom: 'As St-Vincent-Bragny', role: 'admin' },
  { id: 2, nom: 'JS Ouroux-sur-Saône', role: 'joueur' },
];

const ADMIN_CODE = 'PING';

const save = async (list: Club[], id: number | null) => {
  await AsyncStorage.setItem('mesClubs', JSON.stringify(list));
  if (id) await AsyncStorage.setItem('activeClubId', id.toString());
};

export function useProfile() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [me, setMeId] = useState<number | null>(null);
  const [adminFlag, setAdminFlag] = useState(false);

  const load = useCallback(async () => {
    try {
      const [raw, act, mine, adm] = await Promise.all(
        ['mesClubs', 'activeClubId', 'monJoueurId', 'isAdmin'].map(k => AsyncStorage.getItem(k)),
      );
      setMeId(mine ? parseInt(mine) : null);
      setAdminFlag(adm === 'true');
      if (!raw) {
        setClubs(DEMO);
        setActiveId(1);
        await save(DEMO, 1);
        return;
      }
      const list: Club[] = JSON.parse(raw);
      setClubs(list);
      setActiveId(act ? parseInt(act) : (list[0]?.id ?? null));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const switchClub = (c: Club) => {
    setActiveId(c.id);
    AsyncStorage.setItem('activeClubId', c.id.toString());
  };

  const addClub = (nom: string, code: string) => {
    const club: Club = { id: Date.now(), nom: nom || 'Nouveau Club', role: code === ADMIN_CODE ? 'admin' : 'joueur' };
    const list = [...clubs, club];
    setClubs(list);
    setActiveId(club.id);
    save(list, club.id);
    return club;
  };

  const setMe = async (id: number) => {
    await AsyncStorage.setItem('monJoueurId', id.toString());
    setMeId(id);
  };

  const club = clubs.find(c => c.id === activeId) ?? clubs[0];
  const isAdmin = adminFlag || club?.role === 'admin';

  return { clubs, club, activeId, me, isAdmin, load, switchClub, addClub, setMe };
}
