import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    // Mock de autenticação - Em produção integraria com AWS Cognito
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 px-6">
      <View className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <Text className="text-3xl font-bold text-center text-primary-600 mb-2">Va'aFlow</Text>
        <Text className="text-center text-gray-500 mb-8">Agendamento de Remadas Va'a</Text>

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
            placeholder="Sua senha secreta"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="w-full bg-primary-600 rounded-lg py-4 items-center mb-4"
          onPress={handleLogin}
        >
          <Text className="text-white font-bold text-lg">Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full items-center"
          onPress={() => router.push('/register')}
        >
          <Text className="text-primary-600 font-medium">Criar nova conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
