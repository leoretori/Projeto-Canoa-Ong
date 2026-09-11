/**
 * Hook para consumo de Sessões / Remadas do Va'aFlow.
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 */

import { useState, useEffect, useCallback } from 'react';
import { api, Session } from '../services/api';

const PAGE_SIZE = 20;

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(PAGE_SIZE);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchSessions = useCallback(async (currentLimit: number) => {
    try {
      setError(null);
      const data = await api.getSessions(currentLimit);
      setSessions(data);
      setHasMore(data.length >= currentLimit);
      if ((data as any).__isFallback) {
        setError('Sem conexão com o servidor — mostrando dados de exemplo.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar remadas');
    }
  }, []);

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
      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar remada');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    sessions,
    loading,
    loadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    createSession
  };
}
