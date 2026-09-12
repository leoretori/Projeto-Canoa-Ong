import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { getStoredTheme, toggleTheme, subscribeAccessibility, ThemeMode } from '../utils/accessibility';

interface ThemeToggleProps {
  showLabel?: boolean;
}

export function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    setTheme(getStoredTheme());
    const unsubscribe = subscribeAccessibility(() => {
      setTheme(getStoredTheme());
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container hover:opacity-80 border border-outline-variant/30"
    >
      <Text className="text-sm">{isDark ? '☀️' : '🌙'}</Text>
      {showLabel && (
        <Text className="text-xs font-semibold text-primary">
          {isDark ? 'Modo Claro' : 'Modo Escuro'}
        </Text>
      )}
    </TouchableOpacity>
  );
}
