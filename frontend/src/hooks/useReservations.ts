/**
 * Hook para reservas e controle de assentos adaptados.
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 */

import { useState, useEffect, useCallback } from 'react';
import { api, Reservation } from '../services/api';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMyReservations();
      setReservations(data);
      if ((data as any).__isFallback) {
        setError('Sem conexão com o servidor — mostrando dados de exemplo.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  }, []);

  const bookSession = async (sessionId: string, requiresAdapted: boolean, notes?: string) => {
    try {
      setLoading(true);
      setError(null);
      const newReservation = await api.createReservation(sessionId, requiresAdapted, notes);
      setReservations((prev) => [newReservation, ...prev]);
      return newReservation;
    } catch (err: any) {
      setError(err.message || 'Falha ao reservar vaga');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (sessionId: string, userId?: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.cancelReservation(sessionId, userId);
      setReservations((prev) => prev.filter((r) => r.session_id !== sessionId));
    } catch (err: any) {
      setError(err.message || 'Falha ao cancelar reserva');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReservations();
  }, [fetchMyReservations]);

  return {
    reservations,
    loading,
    error,
    refresh: fetchMyReservations,
    bookSession,
    cancelReservation
  };
}

