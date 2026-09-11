import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { showAlert } from '../utils/alert';
import { useRouter } from 'expo-router';
import { signUp, confirmSignUp, resendConfirmationCode } from '../services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [needsAccessibility, setNeedsAccessibility] = useState(false);
  const [loading, setLoading] = useState(false);

  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showAlert('Erro', 'Preencha os campos obrigatórios.');
      return;
    }
    if (password.length < 8) {
      showAlert('Erro', 'A senha precisa ter no mínimo 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await signUp(name, email.trim(), password, needsAccessibility);
      setAwaitingConfirmation(true);
      showAlert('Quase lá', 'Enviamos um código de confirmação para o seu e-mail.');
    } catch (err: any) {
      const code = err?.code || err?.name;
      if (code === 'UsernameExistsException') {
        showAlert('Erro', 'Já existe uma conta com esse e-mail.');
      } else if (code === 'InvalidPasswordException') {
        showAlert('Erro', 'Senha não atende aos requisitos (mín. 8 caracteres, maiúscula e número).');
      } else {
        showAlert('Erro', err?.message || 'Falha ao criar conta.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmationCode) {
      showAlert('Erro', 'Digite o código recebido por e-mail.');
      return;
    }
    setLoading(true);
    try {
      await confirmSignUp(email.trim(), confirmationCode.trim());
      showAlert('Sucesso', 'Conta confirmada! Faça login para continuar.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendConfirmationCode(email.trim());
      showAlert('Reenviado', 'Um novo código foi enviado ao seu e-mail.');
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Não foi possível reenviar o código.');
    }
  };

  if (awaitingConfirmation) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-50 dark:bg-gray-950">
        <View className="flex-1 justify-center px-6 py-12 items-center">
          <View className="w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <Text className="text-2xl font-bold text-center text-primary-600 mb-2">Confirme seu e-mail</Text>
            <Text className="text-center text-gray-500 mb-6">
              Digite o código de 6 dígitos enviado para {email}
            </Text>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-1">Código de confirmação</Text>
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                placeholder="000000"
                value={confirmationCode}
                onChangeText={setConfirmationCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              className="w-full bg-primary-600 rounded-lg py-4 items-center mb-4"
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-lg">Confirmar</Text>}
            </TouchableOpacity>

            <TouchableOpacity className="w-full items-center mb-2" onPress={handleResend}>
              <Text className="text-primary-600 font-medium">Reenviar código</Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-full items-center" onPress={() => router.back()}>
              <Text className="text-gray-500 font-medium">Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-50 dark:bg-gray-950">
      <View className="flex-1 justify-center px-6 py-12 items-center">
        <View className="w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
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

          <View className="mb-8 p-4 bg-primary-50 border border-primary-100 rounded-lg flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-gray-800 font-bold mb-1">Acessibilidade Módulo Va'aFlow</Text>
              <Text className="text-xs text-gray-500">
                Marque se você for cadeirante ou tiver mobilidade reduzida para prepararmos o assento adaptado na Va'a.
              </Text>
            </View>
            <Switch
              value={needsAccessibility}
              onValueChange={setNeedsAccessibility}
              trackColor={{ false: '#d1d5db', true: '#0E7490' }}
              thumbColor={needsAccessibility ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          <TouchableOpacity 
            className="w-full bg-primary-600 rounded-lg py-4 items-center mb-4"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-lg">Criar Conta</Text>}
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
