/**
 * Perfil do usuário — dados de contato e necessidades de acessibilidade.
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { api, UserProfile } from '../../services/api';
import { showAlert } from '../../utils/alert';

const ACCESSIBILITY_TYPES: { value: UserProfile['accessibility_type']; label: string }[] = [
  { value: 'NONE', label: 'Nenhuma' },
  { value: 'WHEELCHAIR', label: 'Cadeirante' },
  { value: 'REDUCED_MOBILITY', label: 'Mobilidade reduzida' },
  { value: 'VISUAL_IMPAIRMENT', label: 'Deficiência visual' },
  { value: 'OTHER', label: 'Outra' },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [phone, setPhone] = useState('');
  const [hasNeeds, setHasNeeds] = useState(false);
  const [accessType, setAccessType] = useState<UserProfile['accessibility_type']>('NONE');
  const [notes, setNotes] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data);
      setPhone(data.phone || '');
      setHasNeeds(data.has_accessibility_needs);
      setAccessType(data.accessibility_type);
      setNotes(data.notes || '');
    } catch (err: any) {
      showAlert('Erro', err.message || 'Não foi possível carregar seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateProfile({
        phone,
        has_accessibility_needs: hasNeeds,
        accessibility_type: hasNeeds ? accessType : 'NONE',
        notes,
      });
      showAlert('Sucesso', 'Perfil atualizado.');
    } catch (err: any) {
      showAlert('Erro', err.message || 'Não foi possível salvar seu perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-800">
        <ActivityIndicator size="large" color="#0E7490" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950 px-4 py-6" accessibilityLabel="Tela de Perfil">
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 dark:text-white mb-1" accessibilityRole="header">
        Meu Perfil
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-6">
        Esses dados ajudam a equipe do CPT a preparar seu embarque.
      </Text>

      <View className="bg-white dark:bg-gray-900 p-5 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold mb-1">Nome</Text>
        <Text className="text-gray-800 dark:text-gray-100 font-medium mb-4">{profile?.name}</Text>

        <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold mb-1">E-mail</Text>
        <Text className="text-gray-800 dark:text-gray-100 font-medium mb-4">{profile?.email}</Text>

        <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold mb-1">Telefone</Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100 mb-2"
          placeholder="(11) 99999-9999"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View className="bg-white dark:bg-gray-900 p-5 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 pr-3">
            <Text className="font-bold text-gray-800 dark:text-gray-100">♿ Necessidade de Acessibilidade</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Ativando, seus agendamentos já vêm com assento adaptado pré-marcado.
            </Text>
          </View>
          <Switch
            value={hasNeeds}
            onValueChange={setHasNeeds}
            trackColor={{ false: '#d1d5db', true: '#0E7490' }}
          />
        </View>

        {hasNeeds && (
          <View className="mb-2">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tipo</Text>
            <View className="flex-row flex-wrap gap-2">
              {ACCESSIBILITY_TYPES.filter((t) => t.value !== 'NONE').map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setAccessType(t.value)}
                  className={`px-3 py-2 rounded-full border ${
                    accessType === t.value ? 'bg-primary-700 border-primary-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Text className={`text-xs font-medium ${accessType === t.value ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold mb-1 mt-4">
          Observações para a equipe de embarque
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100"
          placeholder="Ex: uso cadeira de rodas manual, preciso de apoio para transferência"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        className="w-full bg-primary-700 rounded-xl py-4 items-center mb-8"
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold">Salvar Perfil</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
