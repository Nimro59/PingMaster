import { useState } from 'react';
import { api } from '@/hooks/useApi';
import { today } from '@/utils/fmt';
import { hap } from '@/utils/hap';

export type Presence = 'absent' | 'present';

const key = (id: number, date = today()) => `${date}:${id}`;

export function useAppel() {
  const [marks, setMarks] = useState<Partial<Record<string, Presence>>>({});

  const statusOf = (id: number) => marks[key(id)];

  const mark = async (id: number, statut: Presence) => {
    const date = today();
    const k = key(id, date);
    const prev = marks[k];
    hap.tap();
    setMarks(m => ({ ...m, [k]: statut }));
    try {
      await api.post('/presences', { joueur_id: id, date, statut });
    } catch {
      hap.err();
      setMarks(m => (m[k] === statut ? { ...m, [k]: prev } : m));
    }
  };

  return { statusOf, mark };
}
