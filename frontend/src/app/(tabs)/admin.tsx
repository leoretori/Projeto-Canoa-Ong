/**
 * Painel de Gestão e Criação de Remadas para Instrutores.
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useSessions } from '../../hooks/useSessions';

export default function AdminScreen() {
  const { sessions, loading, createSession, refresh } = useSessions();
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [date, setDate] = useState('2026-10-28');
  const [time, setTime] = useState('06:00');
  const [location, setLocation] = useState('Praia Grande - São Sebastião');
  const [canoeType, setCanoeType] = useState('OC6');
  const [totalCapacity, setTotalCapacity] = useState('6');
  const [maxAdaptedSeats, setMaxAdaptedSeats] = useState('2');
  const [instructorName, setInstructorName] = useState('Instrutor CPT');
  const [creating, setCreating] = useState(false);

  const handleCreateSession = async () => {
    if (!date || !time || !location) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setCreating(true);
      await createSession({
        date,
        time,
        location,
        canoe_type: canoeType,
        total_capacity: parseInt(totalCapacity, 10) || 6,
        max_adapted_seats: parseInt(maxAdaptedSeats, 10) || 2,
        instructor_name: instructorName
      });
      setModalVisible(false);
      Alert.alert('Sucesso!', 'Nova remada inclusiva cadastrada no calendário.');
    } catch (err: any) {
      Alert.alert('Erro ao criar remada', err.message || 'Verifique os dados informados.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 px-4 py-6"
      accessibilityLabel="Painel de gestão de remadas"
    >
      <View className="mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900" accessibilityRole="header">
            Painel do Instrutor
          </Text>
          <Text className="text-gray-500">
            Controle de frota, horários e assentos adaptados.
          </Text>
        </View>
        <TouchableOpacity 
          className="bg-blue-700 px-4 py-2.5 rounded-xl flex-row items-center shadow-sm"
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Cadastrar nova remada"
        >
          <Text className="text-white font-bold text-sm">+ Nova Remada</Text>
        </TouchableOpacity>
      </View>

      {loading && sessions.length === 0 ? (
        <View className="py-12 items-center">
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text className="text-gray-500 mt-2">Carregando painel...</Text>
        </View>
      ) : (
        sessions.map((session) => (
          <View key={session.session_id} className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row justify-between mb-3 border-b border-gray-100 pb-3 items-center">
              <View>
                <Text className="text-lg font-bold text-gray-900">{session.date} - {session.time}</Text>
                <Text className="text-xs text-gray-500">{session.location} • {session.canoe_type}</Text>
              </View>
              <View className={`px-2.5 py-1 rounded-full ${session.status === 'FULL' ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                <Text className={`text-xs font-bold ${session.status === 'FULL' ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {session.status}
                </Text>
              </View>
            </View>
            
            <View className="flex-row justify-between mb-4">
              <View className="bg-gray-50 p-3 rounded-xl flex-1 mr-2">
                <Text className="text-xs text-gray-500">Capacidade Geral</Text>
                <Text className="text-lg font-bold text-gray-800">{session.booked_seats} / {session.total_capacity}</Text>
              </View>
              <View className="bg-blue-50 p-3 rounded-xl flex-1 ml-2">
                <Text className="text-xs text-blue-700">♿ Assentos Adaptados</Text>
                <Text className="text-lg font-bold text-blue-800">{session.booked_adapted_seats} / {session.max_adapted_seats}</Text>
              </View>
            </View>
          </View>
        ))
      )}

      {/* Modal de Criação de Remada */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white p-6 rounded-t-3xl max-h-[85%]">
            <Text className="text-xl font-bold text-gray-900 mb-4">Cadastrar Nova Remada</Text>

            <ScrollView className="space-y-4 mb-4">
              <View>
                <Text className="text-xs font-bold text-gray-700 mb-1">Data (YYYY-MM-DD)</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800"
                  value={date}
                  onChangeText={setDate}
                  placeholder="2026-10-28"
                />
              </View>

              <View className="mt-3">
                <Text className="text-xs font-bold text-gray-700 mb-1">Horário (HH:MM)</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800"
                  value={time}
                  onChangeText={setTime}
                  placeholder="06:00"
                />
              </View>

              <View className="mt-3">
                <Text className="text-xs font-bold text-gray-700 mb-1">Local de Saída</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              <View className="flex-row gap-3 mt-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-700 mb-1">Vagas Totais</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800"
                    value={totalCapacity}
                    onChangeText={setTotalCapacity}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-blue-700 mb-1">♿ Vagas Adaptadas</Text>
                  <TextInput
                    className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-blue-900 font-bold"
                    value={maxAdaptedSeats}
                    onChangeText={setMaxAdaptedSeats}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="mt-3">
                <Text className="text-xs font-bold text-gray-700 mb-1">Nome do(a) Instrutor(a)</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800"
                  value={instructorName}
                  onChangeText={setInstructorName}
                />
              </View>
            </ScrollView>

            <View className="flex-row gap-3 pt-2 border-t border-gray-100">
              <TouchableOpacity
                className="flex-1 py-3.5 bg-gray-100 rounded-xl items-center"
                onPress={() => setModalVisible(false)}
                disabled={creating}
              >
                <Text className="text-gray-700 font-medium">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3.5 bg-blue-700 rounded-xl items-center flex-row justify-center"
                onPress={handleCreateSession}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold">Salvar Remada</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
