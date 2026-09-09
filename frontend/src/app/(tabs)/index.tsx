import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';

const MOCK_SESSIONS = [
  { id: '1', date: '25/10/2026', time: '06:00', total: 6, booked: 4, adapted: 1, maxAdapted: 2 },
  { id: '2', date: '25/10/2026', time: '08:00', total: 6, booked: 6, adapted: 2, maxAdapted: 2 },
  { id: '3', date: '26/10/2026', time: '06:00', total: 6, booked: 0, adapted: 0, maxAdapted: 2 },
];

export default function CalendarScreen() {
  const handleBook = (session: any) => {
    if (session.booked >= session.total) {
      Alert.alert('Esgotado', 'Não há vagas nesta canoa.');
      return;
    }
    Alert.alert('Confirmar Reserva', `Deseja agendar remada para ${session.date} às ${session.time}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => Alert.alert('Sucesso', 'Vaga reservada com sucesso!') }
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800">Próximas Remadas</Text>
        <Text className="text-gray-500">Escolha um horário disponível para reservar sua vaga.</Text>
      </View>

      {MOCK_SESSIONS.map((session) => {
        const isFull = session.booked >= session.total;
        return (
          <View key={session.id} className="bg-white p-5 rounded-xl mb-4 shadow-sm border border-gray-100 flex-row justify-between items-center">
            <View>
              <Text className="text-lg font-bold text-primary-600">{session.date}</Text>
              <Text className="text-gray-700 font-medium mb-2">{session.time} - Saída Praia Grande</Text>
              <Text className="text-sm text-gray-500">
                Vagas: {session.booked}/{session.total}
              </Text>
              <Text className="text-xs text-blue-500 mt-1">
                Acessibilidade: {session.adapted}/{session.maxAdapted} cadeiras
              </Text>
            </View>
            
            <TouchableOpacity 
              className={`px-4 py-2 rounded-lg justify-center items-center ${isFull ? 'bg-gray-300' : 'bg-accent-500'}`}
              disabled={isFull}
              onPress={() => handleBook(session)}
            >
              <Text className="text-white font-bold">{isFull ? 'Esgotado' : 'Agendar'}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

