import { useCallback, useState } from 'react';
import { API_URL } from '@/constants/config';

type Opt = { method?: 'GET' | 'POST' | 'DELETE'; body?: unknown };

const fail = (msg: string) => Object.assign(new Error(msg), { isApi: true });

export async function req<T>(path: string, { method = 'GET', body }: Opt = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw fail(typeof data?.detail === 'string' ? data.detail : `Erreur ${res.status}`);
  return data as T;
}

export const api = {
  get: <T>(path: string) => req<T>(path),
  post: <T = unknown>(path: string, body?: unknown) => req<T>(path, { method: 'POST', body }),
  del: <T = unknown>(path: string) => req<T>(path, { method: 'DELETE' }),
};

export const errMsg = (e: unknown, fallback = 'Problème de connexion.') =>
  e instanceof Error && 'isApi' in e ? e.message : fallback;

export function useApi<T>(path: string | null, init: T) {
  const [data, setData] = useState<T>(init);
  const [isLoad, setLoad] = useState(false);
  const [isReady, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = useCallback(
    async (silent = false) => {
      if (!path) return;
      if (!silent) setLoad(true);
      try {
        setData(await api.get<T>(path));
        setErr(null);
      } catch (e) {
        setErr(errMsg(e));
      } finally {
        setReady(true);
        if (!silent) setLoad(false);
      }
    },
    [path],
  );

  return { data, setData, isLoad, isReady, err, run };
}
