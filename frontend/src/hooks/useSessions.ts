/**
 * Hook para consumo de Sessões / Remadas do Va'aFlow.
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 */

import { useState, useEffect, useCallback } from 'react';
import { api, Session } from '../services/api';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar remadas');
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refresh: fetchSessions,
    createSession
  };
}

