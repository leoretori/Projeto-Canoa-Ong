/**
 * Tela de Minhas Remadas (Histórico e Cancelamento).
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 * Focado em acessibilidade para atletas com deficiência.
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useReservations } from '../../hooks/useReservations';
import { showAlert } from '../../utils/alert';

export default function MyReservationsScreen() {
  const { reservations, loading, error, cancelReservation, refresh } = useReservations();

  const doCancel = async (reservation: any) => {
    try {
      await cancelReservation(reservation.session_id);
      showAlert('Sucesso', 'Sua reserva foi cancelada e a vaga liberada.');
    } catch (err: any) {
      showAlert('Erro', err.message || 'Não foi possível cancelar a reserva.');
    }
  };

  const handleCancel = (reservation: any) => {
    showAlert(
      'Cancelar Reserva',
      'Tem certeza que deseja cancelar sua vaga para a remada? O assento será imediatamente liberado para a comunidade.',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, Cancelar', style: 'destructive', onPress: () => doCancel(reservation) },
      ]
    );
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 dark:bg-gray-950 px-4 py-6"
      accessibilityLabel="Tela de Minhas Remadas"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#0E7490']} />}
    >
      {error && (
        <View className="bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4">
          <Text className="text-rose-700 text-sm font-medium">{error}</Text>
        </View>
      )}

      <View className="mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 dark:text-white" accessibilityRole="header">
            Minhas Remadas
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 dark:text-gray-400">
            Acompanhe suas vagas confirmadas no Projeto Canoa Para Todos.
          </Text>
        </View>
        <TouchableOpacity 
          onPress={refresh} 
          className="bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg"
          accessibilityRole="button"
          accessibilityLabel="Atualizar lista de reservas"
        >
          <Text className="text-primary-700 font-medium text-xs">Atualizar</Text>
        </TouchableOpacity>
      </View>

      {loading && reservations.length === 0 ? (
        <View className="py-12 items-center">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="text-gray-500 dark:text-gray-400 mt-2">Carregando suas reservas...</Text>
        </View>
      ) : reservations.length === 0 ? (
        <View className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 items-center my-6">
          <Text className="text-4xl mb-2">🛶</Text>
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 dark:text-gray-100 mb-1">Nenhuma remada agendada</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
            Navegue até a aba "Agendar" para escolher seu próximo horário na água.
          </Text>
        </View>
      ) : (
        reservations.map((res) => (
          <View 
            key={res.reservation_id} 
            className="bg-white dark:bg-gray-900 p-5 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-800"
            accessible={true}
            accessibilityLabel={`Reserva confirmada. Status: ${res.status}. Assento adaptado: ${res.requires_adapted_seat ? 'Sim' : 'Não'}.`}
          >
            <View className="flex-row justify-between items-start mb-3 border-b border-gray-100 pb-3">
              <View>
                <Text className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Status</Text>
                <View className="flex-row items-center mt-0.5">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  <Text className="font-bold text-emerald-700">{res.status}</Text>
                </View>
              </View>
              
              {res.requires_adapted_seat && (
                <View className="bg-primary-50 border border-primary-200 px-2.5 py-1 rounded-full flex-row items-center">
                  <Text className="text-xs font-bold text-primary-800">♿ Assento Adaptado</Text>
                </View>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 dark:text-gray-300 text-sm">
                <Text className="font-bold text-gray-900 dark:text-gray-50">Remador: </Text>{res.user_name}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                Protocolo: {res.reservation_id}
              </Text>
              {res.notes && (
                <Text className="text-xs text-primary-600 mt-2 bg-primary-50 p-2 rounded-lg">
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
