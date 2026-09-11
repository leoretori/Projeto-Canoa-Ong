/**
 * Calendário de Remadas e Agendamento Inclusivo.
 * Redesenhado com o Design System Google Stitch (Canoa Para Todos).
 * Mantém 100% da integração com useSessions, useReservations e DynamoDB atômico.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Modal, RefreshControl, TextInput } from 'react-native';
import { showAlert } from '../../utils/alert';
import { useSessions } from '../../hooks/useSessions';
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
  const { sessions, loading, loadingMore, hasMore, error, refresh, loadMore } = useSessions();
  const { bookSession } = useReservations();

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [needsAdaptedSeat, setNeedsAdaptedSeat] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showPast, setShowPast] = useState(false);
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
        `Sua presença está confirmada para o dia ${selectedSession.date} às ${selectedSession.time} em ${selectedSession.location}. A equipe de praia da Raia 1 estará com a esteira e os equipamentos em prontidão 30 min antes!`
      );
    } catch (err: any) {
      showAlert('Não foi possível agendar', err.message || 'Ocorreu um erro ao processar sua vaga.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-surface px-4 py-6"
      accessibilityLabel="Calendário de Remadas Inclusivas"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#004e68', '#00687a']} />}
    >
      {error && (
        <View className="bg-error-container/60 border border-error p-3.5 rounded-2xl mb-4">
          <Text className="text-on-error-container text-sm font-semibold">{error}</Text>
        </View>
      )}

      {/* HERO BANNER: STITCH DESIGN */}
      <View className="relative w-full overflow-hidden rounded-3xl bg-surface-container-low shadow-sm mb-6">
        <View className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <View className="flex flex-col gap-1.5 max-w-2xl">
            <View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-primary w-fit self-start">
              <View className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <Text className="text-xs font-bold text-primary">Temporada Ativa • Guarderia Raia 1</Text>
            </View>
            <Text className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight" accessibilityRole="header">
              Próximas Remadas
            </Text>
            <Text className="text-sm md:text-base text-on-surface-variant leading-relaxed">
              Canoas Va'a com suporte a assentos adaptados, coletes ergonômicos e acompanhamento náutico especializado.
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={refresh}
            className="flex-row items-center justify-center gap-2 h-12 px-5 rounded-xl bg-surface-container-highest hover:bg-surface-container text-primary shadow-sm self-start md:self-center"
            accessibilityRole="button"
            accessibilityLabel="Recarregar remadas"
          >
            <Text className="text-base">🔄</Text>
            <Text className="text-primary font-bold text-sm">Recarregar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH & FILTERS BAR */}
      <View className="flex flex-col gap-3 mb-6">
        <View className="flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <View className="flex-1">
            <TextInput
              className="w-full h-13 px-4 rounded-xl bg-surface-container-lowest text-on-surface text-sm border border-outline-variant/40 shadow-sm focus:border-primary"
              placeholder="Buscar por data (AAAA-MM-DD) ou local (ex: Praia Grande)..."
              placeholderTextColor="#70787e"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowPast((v) => !v)}
            className="flex-row items-center gap-2 px-4 py-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/30"
            accessibilityRole="button"
          >
            <Text className="text-sm">{showPast ? '☑' : '☐'}</Text>
            <Text className="text-xs font-bold text-on-surface">Mostrar remadas passadas</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View className="flex-row flex-wrap items-center gap-2 pt-1">
          <Text className="text-xs text-on-surface-variant font-bold mr-1">Filtrar por:</Text>
          
          <TouchableOpacity
            onPress={() => setActiveFilter('ALL')}
            className={`h-10 px-4 rounded-full flex-row items-center justify-center transition-all ${
              activeFilter === 'ALL'
                ? 'bg-primary shadow-sm'
                : 'bg-surface-container-low border border-outline-variant/30'
            }`}
          >
            <Text className={`text-xs font-bold ${activeFilter === 'ALL' ? 'text-white' : 'text-on-surface'}`}>
              Todas as remadas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('ADAPTED')}
            className={`h-10 px-4 rounded-full flex-row items-center gap-1.5 justify-center transition-all ${
              activeFilter === 'ADAPTED'
                ? 'bg-primary shadow-sm'
                : 'bg-surface-container-low border border-outline-variant/30'
            }`}
          >
            <Text className="text-xs">♿</Text>
            <Text className={`text-xs font-bold ${activeFilter === 'ADAPTED' ? 'text-white' : 'text-on-surface'}`}>
              Assentos adaptados livres
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('WEEKENDS')}
            className={`h-10 px-4 rounded-full flex-row items-center gap-1.5 justify-center transition-all ${
              activeFilter === 'WEEKENDS'
                ? 'bg-primary shadow-sm'
                : 'bg-surface-container-low border border-outline-variant/30'
            }`}
          >
            <Text className="text-xs">📅</Text>
            <Text className={`text-xs font-bold ${activeFilter === 'WEEKENDS' ? 'text-white' : 'text-on-surface'}`}>
              Finais de semana
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST OF SESSIONS */}
      {loading && sessions.length === 0 ? (
        <View className="py-16 items-center">
          <ActivityIndicator size="large" color="#004e68" />
          <Text className="text-on-surface-variant text-sm font-medium mt-3">Carregando calendário de remadas...</Text>
        </View>
      ) : visibleSessions.length === 0 ? (
        <View className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 items-center my-6 shadow-sm">
          <Text className="text-4xl mb-3">🛶</Text>
          <Text className="text-lg font-bold text-on-surface mb-1">Nenhuma remada encontrada</Text>
          <Text className="text-on-surface-variant text-center text-sm max-w-md">
            {showPast
              ? 'Não foram encontradas remadas com os filtros aplicados.'
              : 'Não há remadas futuras com esses critérios. Experimente marcar "Mostrar remadas passadas" ou redefinir os filtros.'}
          </Text>
        </View>
      ) : (
        <View className="flex flex-col gap-4 mb-8">
          {visibleSessions.map((session) => {
            const isFull = session.booked_seats >= session.total_capacity;
            const isPast = session.date < todayStr();
            const isCancelled = session.status === 'CANCELLED';
            const isDisabled = isFull || isPast || isCancelled;
            const freeAdaptedSeats = Math.max(0, session.max_adapted_seats - session.booked_adapted_seats);
            const occupancyPercent = Math.min(100, Math.round((session.booked_seats / session.total_capacity) * 100));
            const isLastSeats = !isFull && (session.total_capacity - session.booked_seats <= 2);

            return (
              <View 
                key={session.session_id} 
                className={`bg-surface-container-lowest rounded-2xl p-5 md:p-6 shadow-sm border border-outline-variant/30 transition-all ${isPast ? 'opacity-60' : ''}`}
                accessible={true}
                accessibilityLabel={`Remada dia ${session.date} às ${session.time}. Local: ${session.location}. Ocupação: ${session.booked_seats} de ${session.total_capacity}. Assentos adaptados livres: ${freeAdaptedSeats}.`}
              >
                <View className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left Column: Date & Time Box */}
                  <View className="flex flex-row items-start gap-4">
                    <View className="flex flex-col items-center justify-center min-w-[105px] p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-center">
                      <Text className="text-xl">🌅</Text>
                      <Text className="text-xl font-extrabold text-primary leading-tight mt-1">{session.time}</Text>
                      <Text className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{session.date}</Text>
                    </View>

                    {/* Middle Column: Title & Info */}
                    <View className="flex-1 flex flex-col gap-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Text className="text-lg font-bold text-on-surface leading-tight">
                          Remada Inclusiva • {session.canoe_type || 'OC6'}
                        </Text>
                        
                        {isCancelled ? (
                          <View className="px-2.5 py-0.5 rounded-full bg-rose-100">
                            <Text className="text-[11px] font-bold text-rose-800">CANCELADA</Text>
                          </View>
                        ) : isPast ? (
                          <View className="px-2.5 py-0.5 rounded-full bg-surface-container-high">
                            <Text className="text-[11px] font-bold text-on-surface-variant">ENCERRADA</Text>
                          </View>
                        ) : isFull ? (
                          <View className="px-2.5 py-0.5 rounded-full bg-amber-100">
                            <Text className="text-[11px] font-bold text-amber-800">ESGOTADA</Text>
                          </View>
                        ) : isLastSeats ? (
                          <View className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed">
                            <Text className="text-[11px] font-bold text-on-tertiary-fixed-variant">ÚLTIMAS VAGAS</Text>
                          </View>
                        ) : (
                          <View className="px-2.5 py-0.5 rounded-full bg-secondary-container/40">
                            <Text className="text-[11px] font-bold text-on-secondary-container">ABERTA</Text>
                          </View>
                        )}
                      </View>

                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <Text className="text-xs">📍</Text>
                        <Text className="text-xs md:text-sm text-on-surface-variant font-medium">
                          {session.location} • Canoa {session.canoe_type}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <Text className="text-xs">👨‍🏫</Text>
                        <Text className="text-xs text-on-surface-variant">
                          Mestre / Timoneiro(a): <Text className="font-semibold text-on-surface">{session.instructor_name || 'Equipe Guarderia Raia 1'}</Text>
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Right Column: Occupancy & Booking Button */}
                  <View className="flex flex-col sm:flex-row lg:flex-col lg:items-end justify-between gap-4 border-t lg:border-t-0 border-outline-variant/20 pt-3 lg:pt-0">
                    <View className="flex flex-col gap-1.5 min-w-[210px]">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-medium text-on-surface-variant">
                          Ocupação Geral: <Text className="font-bold text-on-surface">{session.booked_seats} / {session.total_capacity}</Text>
                        </Text>
                        <Text className="text-xs font-bold text-primary">
                          {isFull ? 'Lotado' : `${session.total_capacity - session.booked_seats} livres`}
                        </Text>
                      </View>

                      <View className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                        <View 
                          className={`h-full rounded-full ${isFull ? 'bg-amber-600' : 'bg-secondary'}`} 
                          style={{ width: `${Math.max(5, occupancyPercent)}%` }} 
                        />
                      </View>

                      <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high self-start lg:self-end mt-0.5">
                        <Text className="text-xs">♿</Text>
                        <Text className="text-[11px] font-bold text-primary">
                          {freeAdaptedSeats > 0 ? `${freeAdaptedSeats} Assentos Adaptados livres` : 'Assentos adaptados preenchidos'}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity 
                      className={`h-12 px-6 rounded-xl flex-row items-center justify-center gap-2 shadow-sm transition-all ${
                        isDisabled ? 'bg-surface-container-high' : 'bg-primary hover:bg-primary-container'
                      }`}
                      disabled={isDisabled}
                      onPress={() => openBookingModal(session)}
                      accessibilityRole="button"
                      accessibilityLabel={isDisabled ? 'Remada indisponível' : `Agendar remada para ${session.date}`}
                    >
                      <Text className={`font-bold text-sm ${isDisabled ? 'text-outline' : 'text-on-primary'}`}>
                        {isCancelled ? 'Cancelada' : isPast ? 'Encerrada' : isFull ? 'Esgotado' : 'Agendar Minha Vaga'}
                      </Text>
                      {!isDisabled && <Text className="text-white text-sm font-bold">→</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* LOAD MORE BUTTON */}
      {hasMore && !loading && visibleSessions.length > 0 && (
        <TouchableOpacity
          onPress={loadMore}
          disabled={loadingMore}
          className="py-3.5 items-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 mb-8 shadow-sm"
        >
          {loadingMore ? (
            <ActivityIndicator size="small" color="#004e68" />
          ) : (
            <Text className="text-primary font-bold text-sm">Carregar mais remadas da temporada</Text>
          )}
        </TouchableOpacity>
      )}

      {/* SUPPORT & ACCESS BENTO CARD */}
      <View className="w-full rounded-3xl bg-surface-container-high p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 shadow-sm mb-6">
        <View className="w-13 h-13 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center p-3 shrink-0 shadow-sm">
          <Text className="text-2xl">🏖️</Text>
        </View>
        <View className="flex flex-col gap-1 flex-1">
          <Text className="text-lg font-bold text-primary">Apoio de Praia e Acessibilidade no Embarque</Text>
          <Text className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
            Necessita de esteira de praia ou suporte para transferência na areia? Nossos voluntários estarão prontos para recebê-lo 30 minutos antes do horário de embarque na tenda principal.
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => showAlert('Apoio de Praia CPT', 'Ao confirmar sua vaga com a opção de assento adaptado ativada, a esteira acessível e os monitores de transferência já ficam escalados automaticamente para você!')}
          className="h-11 px-5 rounded-xl bg-surface-container-lowest text-primary font-bold text-xs flex-row items-center justify-center shadow-sm"
        >
          <Text className="text-primary font-bold text-xs">Orientação Prévia</Text>
        </TouchableOpacity>
      </View>

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
                  {selectedSession.date} às {selectedSession.time}
                </Text>
                <Text className="text-xs text-on-surface-variant mt-0.5">
                  Local: {selectedSession.location} • Canoa {selectedSession.canoe_type}
                </Text>
                {selectedSession.instructor_name && (
                  <Text className="text-xs text-on-surface-variant mt-0.5">
                    Instrutor Responsável: {selectedSession.instructor_name}
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
