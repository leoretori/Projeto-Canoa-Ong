import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';

const MOCK_SESSIONS = [
  { id: '1', date: '25/10/2026', time: '06:00', total: 6, booked: 4, adapted: 1, maxAdapted: 2, status: 'OPEN' },
  { id: '2', date: '25/10/2026', time: '08:00', total: 6, booked: 6, adapted: 2, maxAdapted: 2, status: 'FULL' },
];

export default function AdminScreen() {
  const handleCancelSession = (session: any) => {
    Alert.alert('Cancelar Remada', `Tem certeza que deseja cancelar a sessão de ${session.date} às ${session.time}? Isso notificará todos os remadores inscritos.`, [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim, Cancelar', onPress: () => Alert.alert('Cancelada', 'A sessão foi cancelada por motivos de força maior.') }
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
      <View className="mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-800">Painel Gestão Va'aFlow</Text>
          <Text className="text-gray-500">Controle de Frota e Overbooking</Text>
        </View>
        <TouchableOpacity className="bg-primary-600 px-3 py-2 rounded-lg">
          <Text className="text-white font-bold">+ Nova</Text>
        </TouchableOpacity>
      </View>

      {MOCK_SESSIONS.map((session) => (
        <View key={session.id} className="bg-white p-5 rounded-xl mb-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-between mb-3 border-b border-gray-100 pb-3">
            <Text className="text-lg font-bold text-gray-800">{session.date} - {session.time}</Text>
            <View className={`px-2 py-1 rounded ${session.status === 'FULL' ? 'bg-red-100' : 'bg-green-100'}`}>
              <Text className={`text-xs font-bold ${session.status === 'FULL' ? 'text-red-700' : 'text-green-700'}`}>
                {session.status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-sm text-gray-500">Ocupação Geral</Text>
              <Text className="text-lg font-bold text-gray-700">{session.booked} / {session.total}</Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-gray-500">Assentos Adaptados</Text>
              <Text className="text-lg font-bold text-blue-600">{session.adapted} / {session.maxAdapted}</Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-gray-200 px-4 py-2 rounded-lg">
              <Text className="text-gray-700 font-medium">Ver Lista</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-red-50 border border-red-200 px-4 py-2 rounded-lg"
              onPress={() => handleCancelSession(session)}
            >
              <Text className="text-red-600 font-medium">Cancelar Sessão</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

