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

interface ThemeToggleProps {
  showLabel?: boolean;
}

export function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const { colorScheme, setColorScheme } = useColorScheme();

  // Restaura a preferência salva (web) na primeira renderização.
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        setColorScheme(saved);
        document.documentElement.classList.toggle('dark', saved === 'dark');
        document.body.classList.toggle('dark', saved === 'dark');
      }
    }
  }, []);

  const handleToggle = () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.body.classList.toggle('dark', next === 'dark');
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel={colorScheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container hover:opacity-80"
    >
      <Text className="text-sm">{colorScheme === 'dark' ? '☀️' : '🌙'}</Text>
      {showLabel && (
        <Text className="text-xs font-semibold text-primary">
          {colorScheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

