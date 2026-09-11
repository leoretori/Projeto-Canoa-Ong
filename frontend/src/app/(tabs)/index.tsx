/**
 * Calendário de Remadas e Agendamento Inclusivo.
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 * Consome os hooks useSessions e useReservations.
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

  useEffect(() => {
    // Pré-preenche a preferência de assento adaptado a partir do perfil salvo.
    api.getProfile().then((p) => setDefaultAccessibility(p.has_accessibility_needs)).catch(() => {});
  }, []);

  const visibleSessions = useMemo(() => {
    const today = todayStr();
    const query = searchText.trim().toLowerCase();
    return sessions
      .filter((s) => (showPast ? true : s.date >= today))
      .filter((s) => !query || s.date.includes(query) || s.location.toLowerCase().includes(query));
  }, [sessions, showPast, searchText]);

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
      showAlert('Sucesso! 🎉', `Vaga confirmada para ${selectedSession.date} às ${selectedSession.time}. A equipe do CPT estará pronta para o embarque!`);
    } catch (err: any) {
      showAlert('Não foi possível agendar', err.message || 'Ocorreu um erro ao processar sua vaga.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 dark:bg-gray-950 px-4 py-6"
      accessibilityLabel="Lista de remadas disponíveis"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#0E7490']} />}
    >
      {error && (
        <View className="bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4">
          <Text className="text-rose-700 text-sm font-medium">{error}</Text>
        </View>
      )}

      <View className="mb-4 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white" accessibilityRole="header">
            Próximas Remadas
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">
            Canoas Va'a com suporte a assentos adaptados.
          </Text>
        </View>
        <TouchableOpacity 
          onPress={refresh}
          className="bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg"
          accessibilityRole="button"
          accessibilityLabel="Atualizar lista de remadas"
        >
          <Text className="text-primary-700 font-medium text-xs">Recarregar</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 mb-3"
        placeholder="Buscar por data (AAAA-MM-DD) ou local..."
        placeholderTextColor="#9CA3AF"
        value={searchText}
        onChangeText={setSearchText}
      />

      <TouchableOpacity
        onPress={() => setShowPast((v) => !v)}
        className="self-start mb-4 flex-row items-center gap-1.5"
        accessibilityRole="button"
      >
        <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {showPast ? '☑ Mostrando também remadas passadas' : '☐ Mostrar remadas passadas'}
        </Text>
      </TouchableOpacity>

      {loading && sessions.length === 0 ? (
        <View className="py-12 items-center">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="text-gray-500 mt-2">Carregando calendário de remadas...</Text>
        </View>
      ) : visibleSessions.length === 0 ? (
        <View className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 items-center my-6">
          <Text className="text-4xl mb-2">🛶</Text>
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Nenhuma remada disponível</Text>
          <Text className="text-gray-500 text-center text-sm">
            {showPast
              ? 'Ainda não há nenhuma remada cadastrada.'
              : 'Não há remadas futuras no momento. Toque em "Mostrar remadas passadas" para ver o histórico.'}
          </Text>
        </View>
      ) : (
        visibleSessions.map((session) => {
          const isFull = session.booked_seats >= session.total_capacity;
          const isPast = session.date < todayStr();
          const isCancelled = session.status === 'CANCELLED';
          const isDisabled = isFull || isPast || isCancelled;

          return (
            <View 
              key={session.session_id} 
              className={`bg-white dark:bg-gray-900 p-5 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-800 flex-row justify-between items-center ${isPast ? 'opacity-60' : ''}`}
              accessible={true}
              accessibilityLabel={`Remada dia ${session.date} às ${session.time}. Local: ${session.location}. Vagas gerais: ${session.booked_seats} de ${session.total_capacity}. Assentos adaptados: ${session.booked_adapted_seats} de ${session.max_adapted_seats}.`}
            >
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-base">🛶</Text>
                  <Text className="text-lg font-bold text-primary-700 dark:text-primary-300">{session.date}</Text>
                </View>
                <Text className="text-gray-800 dark:text-gray-200 font-medium text-sm mt-0.5">{session.time} • {session.location}</Text>
                
                <View className="flex-row items-center mt-2 gap-2 flex-wrap">
                  <View className="bg-gray-100 px-2.5 py-0.5 rounded-md">
                    <Text className="text-xs text-gray-600 font-medium">
                      Ocupação: {session.booked_seats}/{session.total_capacity}
                    </Text>
                  </View>
                  
                  <View className={`px-2.5 py-0.5 rounded-md ${session.booked_adapted_seats >= session.max_adapted_seats ? 'bg-amber-100' : 'bg-primary-100'}`}>
                    <Text className={`text-xs font-medium ${session.booked_adapted_seats >= session.max_adapted_seats ? 'text-amber-800' : 'text-primary-800'}`}>
                      ♿ {session.booked_adapted_seats}/{session.max_adapted_seats} adaptados
                    </Text>
                  </View>

                  {isCancelled && (
                    <View className="bg-rose-100 px-2.5 py-0.5 rounded-md">
                      <Text className="text-xs font-medium text-rose-800">Cancelada</Text>
                    </View>
                  )}
                </View>

                {session.instructor_name && (
                  <Text className="text-xs text-gray-400 mt-1">
                    Instrutor(a): {session.instructor_name}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                className={`px-4 py-3 rounded-xl justify-center items-center ${isDisabled ? 'bg-gray-200' : 'bg-primary-700'}`}
                disabled={isDisabled}
                onPress={() => openBookingModal(session)}
                accessibilityRole="button"
                accessibilityLabel={isDisabled ? 'Remada indisponível' : `Agendar remada para ${session.date}`}
              >
                <Text className={`font-bold text-sm ${isDisabled ? 'text-gray-400' : 'text-white'}`}>
                  {isCancelled ? 'Cancelada' : isPast ? 'Encerrada' : isFull ? 'Esgotado' : 'Agendar'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}

      {hasMore && !loading && visibleSessions.length > 0 && (
        <TouchableOpacity
          onPress={loadMore}
          disabled={loadingMore}
          className="py-3 items-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-4"
        >
          {loadingMore ? (
            <ActivityIndicator size="small" color="#0E7490" />
          ) : (
            <Text className="text-primary-700 dark:text-primary-300 font-medium text-sm">Carregar mais remadas</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Modal Acessível de Confirmação */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full max-w-sm bg-white p-6 rounded-2xl">
            <Text className="text-xl font-bold text-gray-900 mb-2">Confirmar Reserva</Text>
            {selectedSession && (
              <Text className="text-gray-600 mb-4 text-sm">
                Remada para {selectedSession.date} às {selectedSession.time} em {selectedSession.location}.
              </Text>
            )}

            <View className="bg-primary-50 border border-primary-100 p-4 rounded-xl flex-row items-center justify-between mb-6">
              <View className="flex-1 pr-3">
                <Text className="font-bold text-gray-800 text-sm">♿ Assento Adaptado</Text>
                <Text className="text-xs text-gray-500">
                  Marque se você for cadeirante ou necessitar de apoio especial para remar.
                </Text>
              </View>
              <Switch
                value={needsAdaptedSeat}
                onValueChange={setNeedsAdaptedSeat}
                trackColor={{ false: '#d1d5db', true: '#0E7490' }}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 py-3 bg-gray-100 rounded-xl items-center"
                onPress={() => setModalVisible(false)}
                disabled={bookingLoading}
              >
                <Text className="font-medium text-gray-700">Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 py-3 bg-primary-700 rounded-xl items-center flex-row justify-center"
                onPress={handleConfirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-bold text-white">Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
