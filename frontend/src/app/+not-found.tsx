import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, Linking } from 'react-native';
import { useRouter, Stack } from 'expo-router';

const CPT_LOGO = require('../../assets/images/cpt-logo.png');

export default function NotFoundScreen() {
  const router = useRouter();

  const handleWhatsApp = () => {
    const url = 'https://chat.whatsapp.com/GR1tEIaQrurAatkbZdYpbv?mode=ac_t';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Página Não Encontrada', headerShown: false }} />
      <View className="flex-1 justify-center items-center bg-surface dark:bg-[#0b1320] px-6 py-12 font-sans">
        <View className="w-full max-w-md items-center text-center bg-surface-container-lowest dark:bg-[#111c2e] p-8 rounded-3xl shadow-lg border border-outline-variant/30">
          {/* Logo da ONG */}
          <Image
            source={CPT_LOGO}
            style={{ width: 80, height: 80, borderRadius: 40 }}
            className="bg-white shadow-md mb-6 border border-outline-variant/20"
            resizeMode="contain"
          />

          {/* Badge 404 */}
          <View className="px-3.5 py-1 rounded-full bg-secondary-fixed dark:bg-[#132840] mb-3">
            <Text className="text-xs font-bold text-secondary dark:text-secondary-fixed tracking-wider uppercase">
              Erro 404 • Fora da Raia
            </Text>
          </View>

          <Text
            className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-[#38bdf8] mb-3 text-center"
            accessibilityRole="header"
          >
            Remada Fora de Rota
          </Text>

          <Text className="text-sm text-on-surface-variant dark:text-slate-300 text-center leading-relaxed mb-8">
            Parece que a página que você tentou acessar navegou para águas desconhecidas ou não existe mais. Vamos retornar para a base segura?
          </Text>

          {/* Ações */}
          <View className="w-full gap-3">
            <TouchableOpacity
              onPress={() => router.replace('/')}
              accessibilityRole="button"
              accessibilityLabel="Voltar à Página Inicial"
              className="w-full py-3.5 rounded-xl bg-primary hover:opacity-90 items-center shadow-sm"
            >
              <Text className="text-white font-bold text-sm">
                ← Voltar à Página Inicial
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWhatsApp}
              accessibilityRole="button"
              accessibilityLabel="Avisar a equipe no WhatsApp"
              className="w-full py-3 rounded-xl bg-surface-container-low dark:bg-[#16233b] border border-outline-variant/30 items-center flex-row justify-center gap-2"
            >
              <Text className="text-base">💬</Text>
              <Text className="text-xs font-semibold text-primary dark:text-[#38bdf8]">
                Avisar a equipe no WhatsApp
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-6 text-center">
            Projeto Canoa Para Todos • São Sebastião - SP
          </Text>
        </View>
      </View>
    </>
  );
}

