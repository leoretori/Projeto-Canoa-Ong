/**
 * Hook para consumo de Sessões / Remadas do Va'aFlow.
 * - Recarrega sozinho sempre que a aba volta a ficar visível (evita lista desatualizada
 *   depois de criar uma remada em outra aba).
 * - Por padrão traz só remadas de hoje em diante; includePast=true traz o histórico.
 */

import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { api, Session } from '../services/api';

const PAGE_SIZE = 20;

export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function useSessions(options: { includePast?: boolean } = {}) {
  const includePast = options.includePast ?? false;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(PAGE_SIZE);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchSessions = useCallback(
    async (currentLimit: number) => {
      try {
        setError(null);
        const data = await api.getSessions(currentLimit, includePast ? undefined : todayIso());
        setSessions(data);
        setHasMore(data.length >= currentLimit);
        if ((data as any).__isFallback) {
          setError('Sem conexão com o servidor — mostrando dados de exemplo.');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar remadas');
      }
    },
    [includePast]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setLimit(PAGE_SIZE);
    await fetchSessions(PAGE_SIZE);
    setLoading(false);
  }, [fetchSessions]);

  const loadMore = useCallback(async () => {
    const nextLimit = limit + PAGE_SIZE;
    setLoadingMore(true);
    await fetchSessions(nextLimit);
    setLimit(nextLimit);
    setLoadingMore(false);
  }, [limit, fetchSessions]);

  const createSession = async (sessionData: Partial<Session>) => {
    try {
      setLoading(true);
      const newSession = await api.createSession(sessionData);
      await fetchSessions(limit);
      return newSession;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar remada');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Recarrega ao focar a aba, na primeira montagem e quando o filtro de passadas muda
  // (refresh muda de identidade junto com includePast).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return {
    sessions,
    loading,
    loadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    createSession,
  };
}
