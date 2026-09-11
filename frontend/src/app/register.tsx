import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [needsAccessibility, setNeedsAccessibility] = useState(false);

  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios.');
      return;
    }
    // Mock de registro Cognito
    Alert.alert('Sucesso', 'Conta criada com sucesso!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-50">
      <View className="flex-1 justify-center px-6 py-12 items-center">
        <View className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <Text className="text-2xl font-bold text-center text-primary-600 mb-6">Nova Conta</Text>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">Nome Completo</Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Ex: João Silva"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">E-mail</Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-1">Senha</Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-gray-800 font-bold mb-1">Acessibilidade Módulo Va'aFlow</Text>
              <Text className="text-xs text-gray-500">
                Marque se você for cadeirante ou tiver mobilidade reduzida para prepararmos o assento adaptado na Va'a.
              </Text>
            </View>
            <Switch
              value={needsAccessibility}
              onValueChange={setNeedsAccessibility}
              trackColor={{ false: '#d1d5db', true: '#1E40AF' }}
              thumbColor={needsAccessibility ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          <TouchableOpacity 
            className="w-full bg-primary-600 rounded-lg py-4 items-center mb-4"
            onPress={handleRegister}
          >
            <Text className="text-white font-bold text-lg">Criar Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full items-center"
            onPress={() => router.back()}
          >
            <Text className="text-gray-500 font-medium">Voltar para Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

