import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import { showAlert } from '../utils/alert';
import { useRouter } from 'expo-router';
import { signIn, isAuthenticated, forgotPassword, confirmNewPassword } from '../services/auth';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  getStoredContrast,
  toggleContrast,
  getStoredFontScale,
  setStoredFontScale,
  subscribeAccessibility,
  FontScale,
} from '../utils/accessibility';

const CPT_LOGO = require('../../assets/images/cpt-logo.png');
const LOGIN_HERO = require('../../assets/images/login-hero.jpg');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Acessibilidade & Modos
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>('md');

  // Fluxo de "Esqueci minha senha"
  const [mode, setMode] = useState<'login' | 'forgot-request' | 'forgot-confirm'>('login');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Modais de Apoio
  const [modalPix, setModalPix] = useState(false);
  const [modalInscricao, setModalInscricao] = useState(false);
  const [alunoNome, setAlunoNome] = useState('');
  const [alunoWhats, setAlunoWhats] = useState('');

  useEffect(() => {
    isAuthenticated().then((authenticated) => {
      if (authenticated) {
        router.replace('/(tabs)');
      } else {
        setCheckingSession(false);
      }
    });

    setHighContrast(getStoredContrast());
    setFontScale(getStoredFontScale());

    const unsubscribe = subscribeAccessibility(() => {
      setHighContrast(getStoredContrast());
      setFontScale(getStoredFontScale());
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Atenção', 'Por favor, informe seu e-mail e senha de acesso.');
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
          'Por favor, confirme seu e-mail com o código de verificação antes de entrar.'
        );
      } else if (code === 'NotAuthorizedException') {
        showAlert('Credenciais Inválidas', 'E-mail ou senha incorretos. Verifique seus dados.');
      } else if (code === 'UserNotFoundException') {
        showAlert('Usuário Não Localizado', 'E-mail não cadastrado. Clique em Inscrever-se para criar sua conta.');
      } else {
        showAlert('Erro de Acesso', err?.message || 'Falha ao autenticar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!email) {
      showAlert('Atenção', 'Digite seu e-mail cadastrado para enviarmos o código de redefinição.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setMode('forgot-confirm');
      showAlert('Código Enviado', 'Verifique sua caixa de entrada para o código de recuperação.');
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Não foi possível solicitar a redefinição de senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetCode || !newPassword) {
      showAlert('Atenção', 'Preencha o código de verificação e a nova senha.');
      return;
    }
    if (newPassword.length < 8) {
      showAlert('Senha Curta', 'A nova senha precisa ter no mínimo 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await confirmNewPassword(email.trim(), resetCode.trim(), newPassword);
      showAlert('Senha Atualizada!', 'Sua senha foi redefinida com sucesso. Faça login agora.');
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

  const abrirVLibras = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const vwBtn = document.querySelector('[vw-access-button]') as HTMLElement;
      if (vwBtn) {
        vwBtn.click();
      } else {
        Linking.openURL('https://chat.whatsapp.com/GR1tEIaQrurAatkbZdYpbv?mode=ac_t');
      }
    } else {
      Linking.openURL('https://chat.whatsapp.com/GR1tEIaQrurAatkbZdYpbv?mode=ac_t');
    }
  };

  const copiarChavePix = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText('pix@canoaparatodos.org');
    }
    showAlert('Chave Copiada! 📋', 'Chave PIX (pix@canoaparatodos.org) copiada para a área de transferência.');
  };

  if (checkingSession) {
    return (
      <View className="flex-1 justify-center items-center bg-[#07151f]">
        <ActivityIndicator size="large" color="#2ec4b6" />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${highContrast ? 'bg-black text-white' : 'bg-[#07151f] text-slate-100'} font-sans`}>
      {/* 1. BARRA SUPERIOR DE RECURSOS DE ACESSIBILIDADE STITCH */}
      <View className="bg-[#030f1a] border-b border-[#24425a]/60 px-4 sm:px-8 py-2.5 flex-row items-center justify-between z-50">
        <TouchableOpacity
          onPress={() => router.push('/')}
          className="flex-row items-center gap-2"
          accessibilityRole="link"
          accessibilityLabel="Voltar ao portal oficial"
        >
          <Text className="text-xs text-[#2ec4b6] font-bold">← Portal Acessível</Text>
          <Text className="text-xs text-[#a6c6db] hidden sm:flex">• Canoagem Inclusiva</Text>
        </TouchableOpacity>

        {/* Ferramentas de Acessibilidade */}
        <View className="flex-row items-center gap-2 sm:gap-3">
          <TouchableOpacity
            onPress={() => {
              const next = toggleContrast();
              setHighContrast(next);
            }}
            className={`px-3 py-1 rounded-lg border ${
              highContrast ? 'bg-yellow-400 border-yellow-500' : 'bg-[#102231] border-[#24425a]'
            }`}
            accessibilityRole="button"
            accessibilityLabel={highContrast ? 'Desativar Alto Contraste' : 'Ativar Alto Contraste'}
          >
            <Text className={`text-xs font-semibold ${highContrast ? 'text-black font-bold' : 'text-slate-200'}`}>
              {highContrast ? '👁️ Normal' : '🕶️ Alto Contraste'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center bg-[#102231] border border-[#24425a] rounded-lg p-0.5">
            <TouchableOpacity
              onPress={() => {
                const next: FontScale = fontScale === 'lg' ? 'md' : 'sm';
                setFontScale(next);
                setStoredFontScale(next);
              }}
              className="px-2 py-0.5"
              accessibilityRole="button"
              accessibilityLabel="Diminuir texto"
            >
              <Text className="text-xs font-bold text-[#2ec4b6]">A-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const next: FontScale = fontScale === 'sm' ? 'md' : 'lg';
                setFontScale(next);
                setStoredFontScale(next);
              }}
              className="px-2 py-0.5"
              accessibilityRole="button"
              accessibilityLabel="Aumentar texto"
            >
              <Text className="text-xs font-bold text-[#2ec4b6]">A+</Text>
            </TouchableOpacity>
          </View>

          <ThemeToggle />

          <TouchableOpacity
            onPress={abrirVLibras}
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-[#102231] border border-[#24425a]"
            accessibilityRole="button"
            accessibilityLabel="Suporte em LIBRAS e Central de Acolhimento"
          >
            <Text className="text-xs">🤟</Text>
            <Text className="text-xs font-bold text-[#2ec4b6] hidden sm:inline">VLibras</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. CONTEÚDO PRINCIPAL: LAYOUT SPLIT (50% HERÓI INSPIRADOR / 50% FORMULÁRIO) */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 flex-col lg:flex-row min-h-[calc(100vh-45px)]">
          {/* LADO ESQUERDO: PAINEL VISUAL & EMOCIONAL (DESKTOP) */}
          <View className="lg:w-5/12 relative hidden lg:flex flex-col justify-between p-10 bg-[#07151f] overflow-hidden">
            {/* Foto Autêntica de Fundo */}
            <Image
              source={LOGIN_HERO}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
              resizeMode="cover"
              className="brightness-[0.75] contrast-[1.1]"
            />
            {/* Gradiente Oceânico Protetor */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(7, 21, 31, 0.72)',
              }}
            />

            {/* Topo do Lado Esquerdo */}
            <View className="relative z-10 flex-row items-center gap-2 bg-[#0a1824]/85 border border-[#24425a] rounded-full px-4 py-1.5 w-fit shadow-lg">
              <View className="w-2.5 h-2.5 rounded-full bg-[#ff7849]" />
              <Text className="text-xs font-bold tracking-wider uppercase text-[#2ec4b6]">
                Projeto Canoa Para Todos
              </Text>
            </View>

            {/* Centro: Frase de Impacto & Depoimento */}
            <View className="relative z-10 space-y-6 my-auto pt-12 max-w-md">
              <View className="w-12 h-12 rounded-2xl bg-[#ff7849]/20 border border-[#ff7849]/40 items-center justify-center mb-2">
                <Text className="text-2xl">🌊</Text>
              </View>

              <Text className="text-3xl xl:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                A água não impõe barreiras.{' '}
                <Text className="text-[#ff7849]">Ela liberta.</Text>
              </Text>

              <Text className="text-slate-200 text-base leading-relaxed">
                Acesso exclusivo para atletas, voluntários, instrutores e apoiadores da Canoagem Polinésia Adaptada (Va'a) em São Sebastião - SP.
              </Text>

              {/* Card de Depoimento Oficial */}
              <View className="bg-[#0b1b29]/90 border border-[#24425a] p-5 rounded-2xl shadow-2xl mt-4">
                <Text className="text-amber-400 text-sm mb-2">★★★★★</Text>
                <Text className="text-sm italic text-slate-100 leading-relaxed mb-3">
                  "Na canoa havaiana encontrei força, autonomia e uma família. Remar me mostrou que meus limites estavam apenas na minha mente."
                </Text>
                <View className="flex-row items-center justify-between border-t border-[#24425a]/60 pt-2.5">
                  <Text className="text-xs font-bold text-[#2ec4b6]">Marcos S. • Paratleta & Aluno</Text>
                  <Text className="text-xs text-slate-400">Equipe Va'aFlow</Text>
                </View>
              </View>
            </View>

            {/* Rodapé Esquerdo */}
            <View className="relative z-10 flex-row items-center justify-between text-xs text-slate-300 pt-6 border-t border-[#24425a]/60">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm">🛡️</Text>
                <Text className="text-xs text-slate-300">Ambiente Seguro e Monitorado</Text>
              </View>
              <TouchableOpacity onPress={() => Linking.openURL('https://instagram.com/canoaparatodos')}>
                <Text className="text-xs text-white font-medium hover:underline">@canoaparatodos</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* LADO DIREITO: FORMULÁRIO DE AUTENTICAÇÃO DARK OCEÂNICO */}
          <View className="lg:w-7/12 flex-1 justify-center items-center p-6 sm:p-12 lg:p-16 bg-[#0a1824] relative">
            <View className="w-full max-w-md space-y-6">
              {/* Logo Oficial & Boas-Vindas */}
              <View className="flex-col items-center sm:items-start text-center sm:text-left">
                <TouchableOpacity
                  onPress={() => router.push('/')}
                  className="p-3 rounded-2xl bg-white shadow-lg border border-white/20 mb-4"
                  accessibilityLabel="Página inicial Canoa Para Todos"
                >
                  <Image
                    source={CPT_LOGO}
                    style={{ width: 68, height: 68, borderRadius: 34 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <Text className="text-2xl sm:text-3xl font-extrabold text-[#f6f9ff] tracking-tight">
                  Bem-vindo(a) de volta!
                </Text>
                <Text className="text-[#a6c6db] text-sm sm:text-base mt-1.5 leading-relaxed">
                  Entre com suas credenciais para acessar sua área de treinos, fichas e aulas.
                </Text>
              </View>

              {/* Badge de Acesso Unificado */}
              <View className="bg-[#102231] border border-[#24425a] rounded-xl p-3 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center gap-2">
                  <View className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <Text className="text-xs font-bold text-[#f6f9ff]">Acesso unificado:</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View className="px-2 py-0.5 rounded-md bg-[#0a1824] border border-[#24425a]">
                    <Text className="text-[11px] font-medium text-slate-200">Atletas</Text>
                  </View>
                  <View className="px-2 py-0.5 rounded-md bg-[#0a1824] border border-[#24425a]">
                    <Text className="text-[11px] font-medium text-slate-200">Instrutores</Text>
                  </View>
                  <View className="px-2 py-0.5 rounded-md bg-[#0a1824] border border-[#24425a]">
                    <Text className="text-[11px] font-medium text-slate-200">Voluntários</Text>
                  </View>
                </View>
              </View>

              {/* MODO LOGIN */}
              {mode === 'login' && (
                <View className="space-y-4">
                  {/* Campo E-mail / Identificador */}
                  <View>
                    <Text className="text-sm font-semibold text-[#a6c6db] mb-1.5">
                      E-mail ou CPF cadastrado <Text className="text-[#ff7849] font-bold">*</Text>
                    </Text>
                    <View className="relative justify-center">
                      <TextInput
                        className="w-full pl-4 pr-4 py-3.5 text-base rounded-xl border border-[#24425a] bg-[#132636] text-[#f6f9ff] placeholder-slate-400 focus:border-[#2ec4b6]"
                        placeholder="seu.email@exemplo.com ou CPF"
                        placeholderTextColor="#64748b"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <Text className="text-xs text-[#a6c6db]/80 mt-1">Ex: seu e-mail cadastrado na guarderia</Text>
                  </View>

                  {/* Campo Senha */}
                  <View>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-sm font-semibold text-[#a6c6db]">
                        Senha de acesso <Text className="text-[#ff7849] font-bold">*</Text>
                      </Text>
                      <TouchableOpacity onPress={() => setMode('forgot-request')}>
                        <Text className="text-xs font-semibold text-[#2ec4b6] hover:underline">
                          Esqueceu a senha?
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View className="relative justify-center">
                      <TextInput
                        className="w-full pl-4 pr-12 py-3.5 text-base rounded-xl border border-[#24425a] bg-[#132636] text-[#f6f9ff] placeholder-slate-400 focus:border-[#2ec4b6]"
                        placeholder="Digite sua senha de acesso"
                        placeholderTextColor="#64748b"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 14 }}
                        accessibilityLabel="Mostrar ou ocultar senha"
                      >
                        <Text className="text-base text-[#a6c6db]">{showPassword ? '🙈' : '👁️'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Lembrar neste aparelho */}
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    className="flex-row items-center gap-2.5 pt-1"
                  >
                    <View
                      className={`w-5 h-5 rounded border items-center justify-center ${
                        rememberMe ? 'bg-[#2ec4b6] border-[#2ec4b6]' : 'bg-[#132636] border-[#24425a]'
                      }`}
                    >
                      {rememberMe && <Text className="text-xs text-[#07151f] font-bold">✓</Text>}
                    </View>
                    <Text className="text-sm text-[#a6c6db]">Lembrar meus dados neste aparelho</Text>
                  </TouchableOpacity>

                  {/* Botão de Entrar (Turquesa Oceânico Stitch) */}
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-xl bg-[#2ec4b6] hover:bg-[#25ab9e] active:scale-[0.99] shadow-lg shadow-[#2ec4b6]/20 flex-row items-center justify-center gap-2 mt-2"
                    accessibilityRole="button"
                    accessibilityLabel="Entrar na plataforma"
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#051a1e" />
                    ) : (
                      <>
                        <Text className="text-[#051a1e] font-extrabold text-base">Entrar na Plataforma</Text>
                        <Text className="text-[#051a1e] font-extrabold text-base">→</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* MODO ESQUECI MINHA SENHA: SOLICITAÇÃO */}
              {mode === 'forgot-request' && (
                <View className="space-y-4">
                  <View className="bg-[#102231] p-4 rounded-xl border border-[#24425a]">
                    <Text className="text-sm font-bold text-[#2ec4b6] mb-1">Recuperação de Acesso</Text>
                    <Text className="text-xs text-[#a6c6db] leading-relaxed">
                      Informe o e-mail cadastrado. Enviaremos um código de 6 dígitos para redefinição segura de sua senha.
                    </Text>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-[#a6c6db] mb-1">E-mail Cadastrado</Text>
                    <TextInput
                      className="w-full px-4 py-3.5 rounded-xl border border-[#24425a] bg-[#132636] text-[#f6f9ff]"
                      placeholder="seu.email@exemplo.com"
                      placeholderTextColor="#64748b"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleRequestReset}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#2ec4b6] items-center"
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#051a1e" />
                    ) : (
                      <Text className="text-[#051a1e] font-bold text-sm">Enviar Código de Recuperação</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setMode('login')}
                    className="w-full py-2.5 items-center"
                  >
                    <Text className="text-xs text-[#a6c6db] font-semibold">← Voltar ao Login</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* MODO ESQUECI MINHA SENHA: CONFIRMAÇÃO */}
              {mode === 'forgot-confirm' && (
                <View className="space-y-4">
                  <View className="bg-[#102231] p-4 rounded-xl border border-[#24425a]">
                    <Text className="text-sm font-bold text-[#2ec4b6] mb-1">Digite o Código Recebido</Text>
                    <Text className="text-xs text-[#a6c6db]">
                      Enviamos um código para <Text className="font-bold text-white">{email}</Text>.
                    </Text>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-[#a6c6db] mb-1">Código de 6 dígitos</Text>
                    <TextInput
                      className="w-full px-4 py-3.5 rounded-xl border border-[#24425a] bg-[#132636] text-[#f6f9ff] text-center font-mono text-lg"
                      placeholder="123456"
                      placeholderTextColor="#64748b"
                      value={resetCode}
                      onChangeText={setResetCode}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-[#a6c6db] mb-1">Nova Senha (mín. 8 caracteres)</Text>
                    <TextInput
                      className="w-full px-4 py-3.5 rounded-xl border border-[#24425a] bg-[#132636] text-[#f6f9ff]"
                      placeholder="Digite a nova senha segura"
                      placeholderTextColor="#64748b"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleConfirmReset}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#2ec4b6] items-center"
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#051a1e" />
                    ) : (
                      <Text className="text-[#051a1e] font-bold text-sm">Salvar Nova Senha e Entrar</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setMode('login')}
                    className="w-full py-2.5 items-center"
                  >
                    <Text className="text-xs text-[#a6c6db] font-semibold">Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* DIVISOR: AINDA NÃO PARTICIPA? */}
              <View className="relative items-center justify-center my-6">
                <View className="border-t border-[#24425a] w-full" />
                <View style={{ position: 'absolute' }} className="bg-[#0a1824] px-3">
                  <Text className="text-[11px] font-bold text-[#a6c6db] uppercase tracking-wider">
                    Ainda não participa?
                  </Text>
                </View>
              </View>

              {/* AÇÕES SECUNDÁRIAS STITCH COM ÍCONES */}
              <View className="flex-col sm:flex-row gap-3">
                <TouchableOpacity
                  onPress={() => router.push('/register')}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#2ec4b6]/50 bg-[#102231] hover:bg-[#152d3f] flex-row items-center justify-center gap-2"
                  accessibilityRole="button"
                  accessibilityLabel="Inscrever-se como Aluno ou Voluntário"
                >
                  <Text className="text-base">👤</Text>
                  <Text className="text-xs font-bold text-[#f6f9ff]">Inscrever-se no Projeto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalPix(true)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#ff7849]/50 bg-[#102231] hover:bg-[#152d3f] flex-row items-center justify-center gap-2"
                  accessibilityRole="button"
                  accessibilityLabel="Apoiar projeto com doação via PIX"
                >
                  <Text className="text-base">❤️</Text>
                  <Text className="text-xs font-bold text-[#ff7849]">Doação via PIX</Text>
                </TouchableOpacity>
              </View>

              {/* RODAPÉ INSTITUCIONAL */}
              <View className="pt-4 border-t border-[#24425a]/60 flex-row flex-wrap items-center justify-between text-xs text-[#a6c6db] gap-2">
                <Text className="text-[11px] text-[#a6c6db]">
                  © 2026 Canoa Para Todos • São Sebastião - SP
                </Text>
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity onPress={() => router.push('/')}>
                    <Text className="text-[11px] text-[#2ec4b6] underline">Início</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={abrirVLibras}>
                    <Text className="text-[11px] text-[#2ec4b6] font-semibold">Ajuda Acessível</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL DE DOAÇÃO PIX */}
      <Modal visible={modalPix} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/80 p-4">
          <View className="bg-[#102231] border border-[#24425a] p-6 rounded-3xl max-w-sm w-full items-center shadow-2xl">
            <Text className="text-3xl mb-2">🛶 ❤️</Text>
            <Text className="text-xl font-bold text-white text-center mb-1">Apoie o Canoa Para Todos</Text>
            <Text className="text-xs text-[#a6c6db] text-center mb-4 leading-relaxed">
              Sua doação viabiliza a manutenção de remos adaptados, cadeiras anfíbias e coletes especiais para paratletas.
            </Text>

            <View className="w-full bg-[#0a1824] p-3.5 rounded-xl border border-[#24425a] mb-4 items-center">
              <Text className="text-[11px] font-bold text-[#2ec4b6] uppercase mb-1">Chave PIX Oficial (E-mail)</Text>
              <Text className="text-sm font-mono text-white select-all">pix@canoaparatodos.org</Text>
            </View>

            <TouchableOpacity
              onPress={copiarChavePix}
              className="w-full py-3.5 rounded-xl bg-[#2ec4b6] items-center mb-2"
            >
              <Text className="text-[#051a1e] font-extrabold text-xs uppercase">Copiar Chave PIX</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalPix(false)}
              className="w-full py-2.5 items-center"
            >
              <Text className="text-xs text-[#a6c6db] font-semibold">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}