import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';

const CPT_LOGO = require('../../assets/images/cpt-logo.png');

interface ErrorProps {
  error: Error;
  retry: () => Promise<void>;
}

export default function GlobalErrorScreen({ error, retry }: ErrorProps) {
  const router = useRouter();

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá equipe de suporte do Va'aFlow! Ocorreu uma instabilidade na plataforma: ${error?.message || 'Erro inesperado'}`
    );
    const url = `https://chat.whatsapp.com/GR1tEIaQrurAatkbZdYpbv?mode=ac_t&text=${message}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-surface dark:bg-[#0b1320] px-6 py-12 font-sans">
      <View className="w-full max-w-md items-center text-center bg-surface-container-lowest dark:bg-[#111c2e] p-8 rounded-3xl shadow-xl border border-red-200 dark:border-red-900/50">
        <Image
          source={CPT_LOGO}
          style={{ width: 72, height: 72, borderRadius: 36 }}
          className="bg-white shadow-md mb-4 border border-outline-variant/20"
          resizeMode="contain"
        />

        <View className="px-3.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 mb-3 border border-red-300 dark:border-red-800">
          <Text className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
            Erro 500 • Instabilidade no Mar
          </Text>
        </View>

        <Text
          className="text-2xl font-extrabold text-primary dark:text-[#38bdf8] mb-2 text-center"
          accessibilityRole="header"
        >
          Ocorreu uma Falha Inesperada
        </Text>

        <Text className="text-xs text-on-surface-variant dark:text-slate-300 text-center leading-relaxed mb-4">
          Nossa equipe náutica já foi notificada. Você pode tentar recarregar a operação ou retornar ao porto principal.
        </Text>

        {/* Detalhe do Erro (apenas em dev/debug) */}
        {error?.message ? (
          <View className="w-full bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-900/60 mb-6">
            <Text className="text-[11px] font-mono text-red-700 dark:text-red-300 text-left" numberOfLines={3}>
              {error.message}
            </Text>
          </View>
        ) : null}

        <View className="w-full gap-3">
          <TouchableOpacity
            onPress={retry}
            accessibilityRole="button"
            accessibilityLabel="Tentar reconectar"
            className="w-full py-3.5 rounded-xl bg-primary hover:opacity-90 items-center shadow-sm"
          >
            <Text className="text-white font-bold text-sm">
              🔄 Tentar Novamente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/')}
            accessibilityRole="button"
            accessibilityLabel="Voltar ao início"
            className="w-full py-3 rounded-xl bg-surface-container-low dark:bg-[#16233b] border border-outline-variant/30 items-center"
          >
            <Text className="text-xs font-semibold text-on-surface dark:text-slate-200">
              ← Retornar ao Início
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleWhatsApp}
            accessibilityRole="button"
            accessibilityLabel="Contatar suporte no WhatsApp"
            className="w-full py-2.5 items-center flex-row justify-center gap-1.5"
          >
            <Text className="text-xs">💬</Text>
            <Text className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Informar equipe no WhatsApp
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
