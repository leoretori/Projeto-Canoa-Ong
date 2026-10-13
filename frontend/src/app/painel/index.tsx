/**
 * Calendário de Remadas e Agendamento Inclusivo.
 * Redesenhado com o Design System Google Stitch (Canoa Para Todos).
 * Mantém 100% da integração com useSessions, useReservations e DynamoDB atômico.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Modal, RefreshControl, TextInput } from 'react-native';
import { showAlert } from '../../utils/alert';
import { useSessions } from '../../hooks/useSessions';
import { formatSessionDate } from '../../utils/date';
import { useReservations } from '../../hooks/useReservations';
import { api, Session } from '../../services/api';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isWeekend(dateStr: string): boolean {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const day = d.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }
  } catch {
    // fallback
  }
  return false;
}

export default function CalendarScreen() {
  const [showPast, setShowPast] = useState(false);
  const { sessions, loading, loadingMore, hasMore, error, refresh, loadMore } = useSessions({ includePast: showPast });
  const { bookSession } = useReservations();

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [needsAdaptedSeat, setNeedsAdaptedSeat] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [defaultAccessibility, setDefaultAccessibility] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ADAPTED' | 'WEEKENDS'>('ALL');

  useEffect(() => {
    // Pré-preenche a preferência de assento adaptado a partir do perfil salvo
    api.getProfile().then((p) => setDefaultAccessibility(p.has_accessibility_needs)).catch(() => {});
  }, []);

  const visibleSessions = useMemo(() => {
    const today = todayStr();
    const query = searchText.trim().toLowerCase();
    return sessions
      .filter((s) => (showPast ? true : s.date >= today))
      .filter((s) => {
        if (activeFilter === 'ADAPTED') {
          return s.booked_adapted_seats < s.max_adapted_seats;
        }
        if (activeFilter === 'WEEKENDS') {
          return isWeekend(s.date);
        }
        return true;
      })
      .filter((s) => !query || s.date.includes(query) || s.location.toLowerCase().includes(query) || (s.instructor_name && s.instructor_name.toLowerCase().includes(query)));
  }, [sessions, showPast, searchText, activeFilter]);

  const openBookingModal = (session: Session) => {
    setSelectedSession(session);
    setNeedsAdaptedSeat(defaultAccessibility);
    setModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSession) return;

    try {
      setBookingLoading(true);
      await bookSession(
        selectedSession.session_id, 
        needsAdaptedSeat, 
        needsAdaptedSeat ? 'Assento adaptado solicitado para atleta com mobilidade reduzida' : undefined
      );
      setModalVisible(false);
      refresh();
      showAlert(
        'Vaga Confirmada! 🎉🛶', 
        `Sua presença está confirmada para ${formatSessionDate(selectedSession.date)} às ${selectedSession.time}, em ${selectedSession.location}. Chegue 30 minutos antes.`
      );
    } catch (err: any) {
      showAlert('Não foi possível agendar', err.message || 'Ocorreu um erro ao processar sua vaga.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, width: '100%', maxWidth: 820, alignSelf: 'center' }}
      accessibilityLabel="Calendário de Remadas"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#004e68', '#00687a']} />}
    >
      {error && (
        <View className="bg-error-container/60 border border-error p-3.5 rounded-2xl mb-4">
          <Text className="text-on-error-container text-sm font-semibold">{error}</Text>
        </View>
      )}

      {/* TÍTULO */}
      <View className="flex-row items-center justify-between gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-2xl font-extrabold text-primary" accessibilityRole="header">
            Próximas remadas
          </Text>
          <Text className="text-sm text-on-surface-variant mt-0.5">Escolha uma data e garanta sua vaga.</Text>
        </View>
        <TouchableOpacity
          onPress={refresh}
          className="w-12 h-12 rounded-xl bg-surface-container items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Recarregar remadas"
        >
          <Text className="text-lg">🔄</Text>
        </TouchableOpacity>
      </View>

      {/* BUSCA E FILTROS */}
      <TextInput
        className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest text-on-surface text-base border border-outline-variant/40 mb-3"
        placeholder="Buscar por local"
        placeholderTextColor="#70787e"
        value={searchText}
        onChangeText={setSearchText}
        accessibilityLabel="Buscar remada por local ou data"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5" contentContainerStyle={{ gap: 8 }}>
        {([
          { key: 'ALL', label: 'Todas' },
          { key: 'ADAPTED', label: '♿ Com assento adaptado' },
          { key: 'WEEKENDS', label: 'Fim de semana' },
        ] as const).map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            className={`h-10 px-4 rounded-full items-center justify-center ${
              activeFilter === f.key ? 'bg-primary' : 'bg-surface-container-lowest border border-outline-variant/40'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: activeFilter === f.key }}
          >
            <Text className={`text-sm font-bold ${activeFilter === f.key ? 'text-white' : 'text-on-surface'}`}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setShowPast((v) => !v)}
          className={`h-10 px-4 rounded-full items-center justify-center ${
            showPast ? 'bg-primary' : 'bg-surface-container-lowest border border-outline-variant/40'
          }`}
          accessibilityRole="button"
          accessibilityState={{ selected: showPast }}
        >
          <Text className={`text-sm font-bold ${showPast ? 'text-white' : 'text-on-surface'}`}>Anteriores</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* LISTA */}
      {loading && sessions.length === 0 ? (
        <View className="py-16 items-center">
          <ActivityIndicator size="large" color="#004e68" />
          <Text className="text-on-surface-variant text-sm font-medium mt-3">Carregando remadas...</Text>
        </View>
      ) : visibleSessions.length === 0 ? (
        <View className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 items-center my-4">
          <Text className="text-4xl mb-3">🛶</Text>
          <Text className="text-lg font-bold text-on-surface mb-1">Nenhuma remada encontrada</Text>
          <Text className="text-on-surface-variant text-center text-sm">
            {showPast ? 'Nenhuma remada com esses filtros.' : 'Ainda não há remadas abertas. Volte mais tarde.'}
          </Text>
        </View>
      ) : (
        <View className="gap-4 mb-6">
          {visibleSessions.map((session) => {
            const isFull = session.booked_seats >= session.total_capacity;
            const isPast = session.date < todayStr();
            const isCancelled = session.status === 'CANCELLED';
            const isDisabled = isFull || isPast || isCancelled;
            const freeSeats = Math.max(0, session.total_capacity - session.booked_seats);
            const freeAdaptedSeats = Math.max(0, session.max_adapted_seats - session.booked_adapted_seats);
            const occupancyPercent = Math.min(100, Math.round((session.booked_seats / session.total_capacity) * 100));
            const isLastSeats = !isFull && freeSeats <= 2;

            const badge = isCancelled
              ? { text: 'Cancelada', cls: 'bg-rose-100', txt: 'text-rose-800' }
              : isPast
              ? { text: 'Encerrada', cls: 'bg-surface-container-high', txt: 'text-on-surface-variant' }
              : isFull
              ? { text: 'Esgotada', cls: 'bg-amber-100', txt: 'text-amber-800' }
              : isLastSeats
              ? { text: 'Últimas vagas', cls: 'bg-tertiary-fixed', txt: 'text-on-surface' }
              : { text: 'Aberta', cls: 'bg-emerald-100', txt: 'text-emerald-800' };

            return (
              <View
                key={session.session_id}
                className={`bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 ${isPast ? 'opacity-60' : ''}`}
                accessible={true}
                accessibilityLabel={`Remada ${formatSessionDate(session.date)} às ${session.time}. Local: ${session.location}. ${freeSeats} vagas livres.`}
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-on-surface">{formatSessionDate(session.date)}</Text>
                    <Text className="text-2xl font-extrabold text-primary mt-0.5">
                      {session.time}
                      {session.end_time ? <Text className="text-base font-semibold text-on-surface-variant"> até {session.end_time}</Text> : null}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${badge.cls}`}>
                    <Text className={`text-xs font-bold ${badge.txt}`}>{badge.text}</Text>
                  </View>
                </View>

                <View className="mt-3 gap-1">
                  <Text className="text-sm text-on-surface">📍 {session.location}</Text>
                  <Text className="text-sm text-on-surface-variant">
                    🛶 Canoa {session.canoe_type || 'OC6'}
                    {session.instructor_name ? `  •  Leme: ${session.instructor_name}` : ''}
                  </Text>
                </View>

                <View className="mt-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-on-surface-variant">
                      {session.booked_seats} de {session.total_capacity} vagas
                    </Text>
                    <Text className="text-sm font-bold text-primary">{isFull ? 'Lotado' : `${freeSeats} livres`}</Text>
                  </View>
                  <View className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <View
                      className={`h-full rounded-full ${isFull ? 'bg-amber-600' : 'bg-primary'}`}
                      style={{ width: `${Math.max(5, occupancyPercent)}%` }}
                    />
                  </View>
                  {session.max_adapted_seats > 0 ? (
                    <Text className="text-sm text-on-surface-variant mt-2">
                      ♿ {freeAdaptedSeats > 0 ? `${freeAdaptedSeats} assento(s) adaptado(s) livre(s)` : 'Assentos adaptados preenchidos'}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  className={`mt-4 h-12 rounded-xl items-center justify-center ${isDisabled ? 'bg-surface-container-high' : 'bg-[#ff7849]'}`}
                  disabled={isDisabled}
                  onPress={() => openBookingModal(session)}
                  accessibilityRole="button"
                  accessibilityLabel={isDisabled ? 'Remada indisponível' : `Agendar remada de ${formatSessionDate(session.date)}`}
                >
                  <Text className={`font-extrabold text-base ${isDisabled ? 'text-outline' : 'text-white'}`}>
                    {isCancelled ? 'Cancelada' : isPast ? 'Encerrada' : isFull ? 'Esgotada' : 'Agendar minha vaga'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {hasMore && !loading && visibleSessions.length > 0 && (
        <TouchableOpacity
          onPress={loadMore}
          disabled={loadingMore}
          className="h-12 items-center justify-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 mb-6"
        >
          {loadingMore ? (
            <ActivityIndicator size="small" color="#004e68" />
          ) : (
            <Text className="text-primary font-bold text-sm">Carregar mais</Text>
          )}
        </TouchableOpacity>
      )}

      <Text className="text-sm text-on-surface-variant text-center px-2">
        Precisa de apoio na areia (esteira ou transferência)? Chegue 30 minutos antes e procure a tenda da equipe.
      </Text>

      {/* MODAL DE CONFIRMAÇÃO DE AGENDAMENTO */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <View className="w-full max-w-md bg-surface-container-lowest p-6 rounded-3xl shadow-2xl border border-outline-variant/20">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">🛶</Text>
                <Text className="text-xl font-extrabold text-primary">Confirmar Reserva</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-1">
                <Text className="text-gray-400 font-bold text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            {selectedSession && (
              <View className="bg-surface-container-low p-4 rounded-2xl mb-4 border border-outline-variant/20">
                <Text className="text-xs font-bold text-secondary uppercase tracking-wider">Dados da Expedição</Text>
                <Text className="text-base font-bold text-on-surface mt-0.5">
                  {formatSessionDate(selectedSession.date)} às {selectedSession.time}
                </Text>
                <Text className="text-xs text-on-surface-variant mt-0.5">
                  Local: {selectedSession.location} • Canoa {selectedSession.canoe_type}
                </Text>
                {selectedSession.instructor_name && (
                  <Text className="text-xs text-on-surface-variant mt-0.5">
                    Leme responsável: {selectedSession.instructor_name}
                  </Text>
                )}
              </View>
            )}

            {/* Accessibility Switch */}
            <View className="bg-secondary-container/20 border border-secondary-container/50 p-4 rounded-2xl flex-row items-center justify-between mb-5">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-1.5 mb-0.5">
                  <Text className="text-sm">♿</Text>
                  <Text className="font-bold text-on-surface text-sm">Assento Adaptado</Text>
                </View>
                <Text className="text-xs text-on-surface-variant leading-tight">
                  Ative se você utiliza cadeira de rodas ou necessita de encosto lombar e apoio para transferência.
                </Text>
              </View>
              <Switch
                value={needsAdaptedSeat}
                onValueChange={setNeedsAdaptedSeat}
                trackColor={{ false: '#bfc8ce', true: '#004e68' }}
              />
            </View>

            <View className="bg-surface-container p-3 rounded-xl mb-5 flex-row items-center gap-2">
              <Text className="text-base">ℹ️</Text>
              <Text className="text-xs text-on-surface-variant flex-1">
                Recomendamos chegar 30 minutos antes para regulagem de coletes homologados pela Marinha e esteira de praia.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 py-3.5 bg-surface-container-low rounded-xl items-center border border-outline-variant/30"
                onPress={() => setModalVisible(false)}
                disabled={bookingLoading}
              >
                <Text className="font-bold text-sm text-on-surface-variant">Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 py-3.5 bg-primary rounded-xl items-center flex-row justify-center shadow-sm"
                onPress={handleConfirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-bold text-sm text-white">Confirmar Minha Vaga</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
