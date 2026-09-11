import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { showAlert } from '../utils/alert';
import { useRouter } from 'expo-router';
import { signIn, isAuthenticated, forgotPassword, confirmNewPassword } from '../services/auth';
import { ThemeToggle } from '../components/ThemeToggle';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Fluxo de "Esqueci minha senha"
  const [mode, setMode] = useState<'login' | 'forgot-request' | 'forgot-confirm'>('login');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    isAuthenticated().then((authenticated) => {
      if (authenticated) {
        router.replace('/(tabs)');
      } else {
        setCheckingSession(false);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Erro', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const code = err?.code || err?.name;
      if (code === 'UserNotConfirmedException') {
        showAlert(
          'Conta não confirmada',
          'Confirme seu e-mail com o código enviado antes de entrar.'
        );
      } else if (code === 'NotAuthorizedException') {
        showAlert('Erro', 'E-mail ou senha incorretos.');
      } else if (code === 'UserNotFoundException') {
        showAlert('Erro', 'Usuário não encontrado. Crie uma conta primeiro.');
      } else {
        showAlert('Erro', err?.message || 'Falha ao entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!email) {
      showAlert('Erro', 'Digite seu e-mail primeiro.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setMode('forgot-confirm');
      showAlert('Código enviado', 'Confira seu e-mail para o código de redefinição.');
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Não foi possível enviar o código.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetCode || !newPassword) {
      showAlert('Erro', 'Preencha o código e a nova senha.');
      return;
    }
    if (newPassword.length < 8) {
      showAlert('Erro', 'A nova senha precisa ter no mínimo 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await confirmNewPassword(email.trim(), resetCode.trim(), newPassword);
      showAlert('Sucesso', 'Senha redefinida! Faça login com a nova senha.');
      setMode('login');
      setPassword('');
      setResetCode('');
      setNewPassword('');
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View className="flex-1 justify-center items-center bg-surface dark:bg-gray-950">
        <ActivityIndicator size="large" color="#004e68" />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-surface dark:bg-gray-950 px-6 font-sans">
      <View style={{ position: 'absolute', top: 40, left: 20 }}>
        <TouchableOpacity 
          className="flex-row items-center gap-1 px-3 py-2 rounded-xl bg-surface-container-low"
          onPress={() => router.push('/')}
        >
          <Text className="text-primary text-sm font-semibold">← Voltar ao Portal</Text>
        </TouchableOpacity>
      </View>

      <View style={{ position: 'absolute', top: 40, right: 20 }}>
        <ThemeToggle />
      </View>

      <View className="w-full max-w-sm">
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3 shadow-lg">
            <Text className="text-4xl">🛶</Text>
          </View>
          <Text className="text-3xl font-bold text-center text-primary dark:text-primary-fixed">Va'aFlow</Text>
          <Text className="text-center text-on-surface-variant dark:text-gray-400 mt-1">Canoa Para Todos • Acesso ao Sistema</Text>
        </View>

        <View className="w-full bg-surface-container-lowest dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">

        {mode === 'login' && (
          <>
            <View className="mb-4">
              <Text className="text-on-surface dark:text-gray-300 font-medium mb-1 text-sm">E-mail</Text>
              <TextInput
                className="w-full bg-surface-container-low dark:bg-gray-800 border border-outline-variant/50 dark:border-gray-700 rounded-xl px-4 py-3 text-on-surface dark:text-gray-100"
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-2">
              <Text className="text-on-surface dark:text-gray-300 font-medium mb-1 text-sm">Senha</Text>
              <TextInput
                className="w-full bg-surface-container-low dark:bg-gray-800 border border-outline-variant/50 dark:border-gray-700 rounded-xl px-4 py-3 text-on-surface dark:text-gray-100"
                placeholder="Sua senha secreta"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity className="items-end mb-6" onPress={() => setMode('forgot-request')}>
              <Text className="text-xs text-primary font-medium">Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="w-full bg-primary rounded-xl py-4 items-center mb-4 shadow-sm"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-base">Entrar no Sistema</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              className="w-full items-center"
              onPress={() => router.push('/register')}
            >
              <Text className="text-primary font-medium">Criar nova conta de aluno</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'forgot-request' && (
          <>
            <Text className="text-on-surface-variant dark:text-gray-400 mb-4 text-sm text-center">
              Digite seu e-mail cadastrado para receber um código de redefinição de senha.
            </Text>
            <View className="mb-6">
              <Text className="text-on-surface dark:text-gray-300 font-medium mb-1 text-sm">E-mail</Text>
              <TextInput
                className="w-full bg-surface-container-low dark:bg-gray-800 border border-outline-variant/50 dark:border-gray-700 rounded-xl px-4 py-3 text-on-surface dark:text-gray-100"
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity 
              className="w-full bg-primary rounded-xl py-4 items-center mb-4 shadow-sm"
              onPress={handleRequestReset}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-base">Enviar código</Text>}
            </TouchableOpacity>
            <TouchableOpacity className="w-full items-center" onPress={() => setMode('login')}>
              <Text className="text-on-surface-variant dark:text-gray-400 font-medium">Voltar para login</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'forgot-confirm' && (
          <>
            <Text className="text-on-surface-variant dark:text-gray-400 mb-4 text-sm text-center">
              Digite o código recebido em {email} e sua nova senha.
            </Text>
            <View className="mb-4">
              <Text className="text-on-surface dark:text-gray-300 font-medium mb-1 text-sm">Código</Text>
              <TextInput
                className="w-full bg-surface-container-low dark:bg-gray-800 border border-outline-variant/50 dark:border-gray-700 rounded-xl px-4 py-3 text-on-surface dark:text-gray-100"
                placeholder="000000"
                value={resetCode}
                onChangeText={setResetCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <View className="mb-6">
              <Text className="text-on-surface dark:text-gray-300 font-medium mb-1 text-sm">Nova senha</Text>
              <TextInput
                className="w-full bg-surface-container-low dark:bg-gray-800 border border-outline-variant/50 dark:border-gray-700 rounded-xl px-4 py-3 text-on-surface dark:text-gray-100"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity 
              className="w-full bg-primary rounded-xl py-4 items-center mb-4 shadow-sm"
              onPress={handleConfirmReset}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-base">Redefinir senha</Text>}
            </TouchableOpacity>
            <TouchableOpacity className="w-full items-center" onPress={() => setMode('login')}>
              <Text className="text-on-surface-variant dark:text-gray-400 font-medium">Voltar para login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      </View>
    </View>
  );
}