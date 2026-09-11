import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';

const STORAGE_KEY = 'vaaflow-lgpd-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const consent = window.localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        setVisible(true);
      } else if (consent === 'all') {
        initAnalytics();
      }
    }
  }, []);

  const initAnalytics = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const gaId = process.env.EXPO_PUBLIC_GA_ID || 'G-CPT2026VAA';
    if (!document.getElementById('ga4-script')) {
      const script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      const inline = document.createElement('script');
      inline.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', { anonymize_ip: true });
      `;
      document.head.appendChild(inline);
    }
  };

  const handleAcceptAll = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'all');
    }
    initAnalytics();
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'essential');
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'fixed' as any,
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
      className="max-w-4xl mx-auto bg-surface-container-lowest dark:bg-[#111c2e] p-4 sm:p-5 rounded-2xl shadow-2xl border border-outline-variant/40"
      accessibilityLabel="Consentimento de Cookies e Privacidade LGPD"
      {...(Platform.OS === 'web' ? ({ role: 'region' } as any) : {})}
    >
      <View className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-base">🍪</Text>
            <Text className="text-sm font-bold text-primary dark:text-[#38bdf8]">
              Privacidade & Transparência (LGPD)
            </Text>
          </View>
          <Text className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed">
            Utilizamos cookies estritamente necessários para o funcionamento da plataforma e preferências de acessibilidade. Com seu consentimento, também coletamos métricas anônimas de uso (Google Analytics) para aprimorar os serviços à comunidade.
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5 w-full md:w-auto">
          <TouchableOpacity
            onPress={handleEssentialOnly}
            accessibilityRole="button"
            accessibilityLabel="Rejeitar cookies opcionais e usar apenas essenciais"
            className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-surface-container-low dark:bg-[#16233b] border border-outline-variant/30 items-center"
          >
            <Text className="text-xs font-semibold text-on-surface dark:text-slate-200">
              Apenas Necessários
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAcceptAll}
            accessibilityRole="button"
            accessibilityLabel="Aceitar todos os cookies incluindo analíticos"
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-primary hover:opacity-90 items-center shadow-sm"
          >
            <Text className="text-xs font-bold text-white">
              Aceitar Todos
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
