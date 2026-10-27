import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { api } from '@/hooks/useApi';

export type Srv = 'wake' | 'on' | 'off';

const WAKE_MS = 1200;

export function useServer() {
  const [srv, setSrv] = useState<Srv>('wake');

  const ping = useCallback(async () => {
    const slow = setTimeout(() => setSrv('wake'), WAKE_MS);
    try {
      await api.get('/');
      setSrv('on');
    } catch {
      setSrv('off');
    } finally {
      clearTimeout(slow);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      ping();
    }, [ping]),
  );

  return { srv, ping };
}
