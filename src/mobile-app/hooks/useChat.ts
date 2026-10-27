import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { POLL } from '@/constants/config';
import { api, errMsg } from '@/hooks/useApi';
import { useProfile } from '@/hooks/useProfile';
import type { Message } from '@/types';
import { hap } from '@/utils/hap';

const PSEUDO = 'Gabriel';

export function useChat() {
  const { club, activeId } = useProfile();
  const clubId = activeId ?? 1;
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [isReady, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const cur = useRef(clubId);

  const fetchMsgs = useCallback(async () => {
    try {
      const data = await api.get<Message[]>(`/chat/${clubId}`);
      if (cur.current !== clubId) return;
      setMsgs(data);
      setErr(null);
    } catch (e) {
      if (cur.current !== clubId) return;
      setErr(errMsg(e));
    }
    setReady(true);
  }, [clubId]);

  useFocusEffect(
    useCallback(() => {
      cur.current = clubId;
      fetchMsgs();
      const id = setInterval(fetchMsgs, POLL.chat);
      return () => clearInterval(id);
    }, [clubId, fetchMsgs]),
  );

  const send = async () => {
    if (!draft.trim()) return;
    const contenu = draft;
    setDraft('');
    try {
      await api.post('/chat', { club_id: clubId, auteur: PSEUDO, contenu });
      hap.tap();
      fetchMsgs();
    } catch {
      hap.err();
      setDraft(d => d || contenu);
    }
  };

  return { club, msgs, draft, setDraft, send, isReady, err, pseudo: PSEUDO };
}
