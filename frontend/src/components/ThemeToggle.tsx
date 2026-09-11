/**
 * Alternância manual de tema (claro/escuro).
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 * NativeWind segue a preferência do sistema por padrão — este componente
 * permite ao usuário sobrepor essa escolha, com persistência no navegador.
 */

import React, { useEffect } from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import { useColorScheme } from 'nativewind';

const STORAGE_KEY = 'vaaflow-theme-preference';

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // Restaura a preferência salva (web) na primeira renderização.
  useEffect(() => {
    if (Platform.OS === 'web') {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        setColorScheme(saved);
      }
    }
  }, []);

  const handleToggle = () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    if (Platform.OS === 'web') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel={colorScheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="px-2 py-1"
    >
      <Text className="text-base">{colorScheme === 'dark' ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  );
}
