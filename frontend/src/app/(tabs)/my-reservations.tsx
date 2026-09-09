/**
 * Tela de Minhas Remadas (Histórico e Cancelamento).
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 * Focado em acessibilidade para atletas com deficiência.
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useReservations } from '../../hooks/useReservations';

export default function MyReservationsScreen() {
  const { reservations, loading, cancelReservation, refresh } = useReservations();

  const handleCancel = (reservation: any) => {
    Alert.alert(
      'Cancelar Reserva',
      `Tem certeza que deseja cancelar sua vaga para a remada? O assento será imediatamente liberado para a comunidade.`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelReservation(reservation.session_id);
              Alert.alert('Sucesso', 'Sua reserva foi cancelada e a vaga liberada.');
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Não foi possível cancelar a reserva.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 px-4 py-6"
      accessibilityLabel="Tela de Minhas Remadas"
    >
      <View className="mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900" accessibilityRole="header">
            Minhas Remadas
          </Text>
          <Text className="text-gray-500">
            Acompanhe suas vagas confirmadas no Projeto Canoa Para Todos.
          </Text>
        </View>
        <TouchableOpacity 
          onPress={refresh} 
          className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg"
          accessibilityRole="button"
          accessibilityLabel="Atualizar lista de reservas"
        >
          <Text className="text-blue-700 font-medium text-xs">Atualizar</Text>
        </TouchableOpacity>
      </View>

      {loading && reservations.length === 0 ? (
        <View className="py-12 items-center">
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text className="text-gray-500 mt-2">Carregando suas reservas...</Text>
        </View>
      ) : reservations.length === 0 ? (
        <View className="bg-white p-8 rounded-2xl border border-gray-100 items-center my-6">
          <Text className="text-4xl mb-2">🛶</Text>
          <Text className="text-lg font-bold text-gray-800 mb-1">Nenhuma remada agendada</Text>
          <Text className="text-gray-500 text-center text-sm">
            Navegue até a aba "Agendar" para escolher seu próximo horário na água.
          </Text>
        </View>
      ) : (
        reservations.map((res) => (
          <View 
            key={res.reservation_id} 
            className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100"
            accessible={true}
            accessibilityLabel={`Reserva confirmada. Status: ${res.status}. Assento adaptado: ${res.requires_adapted_seat ? 'Sim' : 'Não'}.`}
          >
            <View className="flex-row justify-between items-start mb-3 border-b border-gray-100 pb-3">
              <View>
                <Text className="text-xs text-gray-400 font-medium uppercase tracking-wider">Status</Text>
                <View className="flex-row items-center mt-0.5">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  <Text className="font-bold text-emerald-700">{res.status}</Text>
                </View>
              </View>
              
              {res.requires_adapted_seat && (
                <View className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full flex-row items-center">
                  <Text className="text-xs font-bold text-blue-800">♿ Assento Adaptado</Text>
                </View>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 text-sm">
                <Text className="font-bold text-gray-900">Remador: </Text>{res.user_name}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                Protocolo: {res.reservation_id}
              </Text>
              {res.notes && (
                <Text className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded-lg">
                  Obs: {res.notes}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className="bg-rose-50 border border-rose-200 py-3 rounded-xl items-center"
              onPress={() => handleCancel(res)}
              accessibilityRole="button"
              accessibilityLabel="Cancelar esta reserva e liberar a vaga"
            >
              <Text className="text-rose-600 font-bold text-sm">Cancelar Vaga</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}
