/**
 * Calendário de Remadas e Agendamento Inclusivo.
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 * Consome os hooks useSessions e useReservations.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch, Modal } from 'react-native';
import { useSessions } from '../../hooks/useSessions';
import { useReservations } from '../../hooks/useReservations';
import { Session } from '../../services/api';

export default function CalendarScreen() {
  const { sessions, loading, refresh } = useSessions();
  const { bookSession } = useReservations();

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [needsAdaptedSeat, setNeedsAdaptedSeat] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const openBookingModal = (session: Session) => {
    setSelectedSession(session);
    setNeedsAdaptedSeat(false);
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
      Alert.alert('Sucesso! 🎉', `Vaga confirmada para ${selectedSession.date} às ${selectedSession.time}. A equipe do CPT estará pronta para o embarque!`);
    } catch (err: any) {
      Alert.alert('Não foi possível agendar', err.message || 'Ocorreu um erro ao processar sua vaga.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 px-4 py-6"
      accessibilityLabel="Lista de remadas disponíveis"
    >
      <View className="mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900" accessibilityRole="header">
            Próximas Remadas
          </Text>
          <Text className="text-gray-500">
            Canoas Va'a com suporte a assentos adaptados.
          </Text>
        </View>
        <TouchableOpacity 
          onPress={refresh}
          className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg"
          accessibilityRole="button"
          accessibilityLabel="Atualizar lista de remadas"
        >
          <Text className="text-blue-700 font-medium text-xs">Recarregar</Text>
        </TouchableOpacity>
      </View>

      {loading && sessions.length === 0 ? (
        <View className="py-12 items-center">
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text className="text-gray-500 mt-2">Carregando calendário de remadas...</Text>
        </View>
      ) : (
        sessions.map((session) => {
          const isFull = session.booked_seats >= session.total_capacity;
          const isAdaptedFull = session.booked_adapted_seats >= session.max_adapted_seats;

          return (
            <View 
              key={session.session_id} 
              className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100 flex-row justify-between items-center"
              accessible={true}
              accessibilityLabel={`Remada dia ${session.date} às ${session.time}. Local: ${session.location}. Vagas gerais: ${session.booked_seats} de ${session.total_capacity}. Assentos adaptados: ${session.booked_adapted_seats} de ${session.max_adapted_seats}.`}
            >
              <View className="flex-1 pr-3">
                <Text className="text-lg font-bold text-primary-600">{session.date}</Text>
                <Text className="text-gray-800 font-medium text-sm mt-0.5">{session.time} • {session.location}</Text>
                
                <View className="flex-row items-center mt-2 gap-2">
                  <View className="bg-gray-100 px-2.5 py-0.5 rounded-md">
                    <Text className="text-xs text-gray-600 font-medium">
                      Ocupação: {session.booked_seats}/{session.total_capacity}
                    </Text>
                  </View>
                  
                  <View className={`px-2.5 py-0.5 rounded-md ${isAdaptedFull ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    <Text className={`text-xs font-medium ${isAdaptedFull ? 'text-amber-800' : 'text-blue-800'}`}>
                      ♿ {session.booked_adapted_seats}/{session.max_adapted_seats} adaptados
                    </Text>
                  </View>
                </View>

                {session.instructor_name && (
                  <Text className="text-xs text-gray-400 mt-1">
                    Instrutor(a): {session.instructor_name}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                className={`px-4 py-3 rounded-xl justify-center items-center ${isFull ? 'bg-gray-200' : 'bg-blue-700'}`}
                disabled={isFull}
                onPress={() => openBookingModal(session)}
                accessibilityRole="button"
                accessibilityLabel={isFull ? 'Remada esgotada' : `Agendar remada para ${session.date}`}
              >
                <Text className={`font-bold text-sm ${isFull ? 'text-gray-400' : 'text-white'}`}>
                  {isFull ? 'Esgotado' : 'Agendar'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
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

            <View className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex-row items-center justify-between mb-6">
              <View className="flex-1 pr-3">
                <Text className="font-bold text-gray-800 text-sm">♿ Assento Adaptado</Text>
                <Text className="text-xs text-gray-500">
                  Marque se você for cadeirante ou necessitar de apoio especial para remar.
                </Text>
              </View>
              <Switch
                value={needsAdaptedSeat}
                onValueChange={setNeedsAdaptedSeat}
                trackColor={{ false: '#d1d5db', true: '#1E40AF' }}
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
                className="flex-1 py-3 bg-blue-700 rounded-xl items-center flex-row justify-center"
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
