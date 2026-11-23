/**
 * Local de encontro + avisos importantes da base (texto da equipe do projeto).
 * Usado nas Orientações de embarque e na confirmação da vaga.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { BASE_LOCAL, IMPORTANT_RULES } from '../constants/base';

export function MeetingPoint({ compact = false }: { compact?: boolean }) {
  return (
    <View className="p-4 rounded-2xl bg-surface-container-low gap-1">
      <Text className="text-base font-extrabold text-primary">📍 Local de encontro</Text>
      <Text className="text-base font-bold text-on-surface">{BASE_LOCAL.name}</Text>
      <Text className="text-base text-on-surface">{BASE_LOCAL.address}</Text>
      <TouchableOpacity
        onPress={() => Linking.openURL(BASE_LOCAL.mapUrl)}
        className={`${compact ? 'mt-1' : 'mt-2'} min-h-[44px] self-start px-4 rounded-xl bg-primary flex-row items-center justify-center`}
        accessibilityRole="link"
        accessibilityLabel="Ver a base no mapa"
      >
        <Text className="text-sm font-bold text-white">🔗 Ver no mapa</Text>
      </TouchableOpacity>
    </View>
  );
}

export function ImportantRules() {
  return (
    <View className="p-4 rounded-2xl bg-amber-50 border border-amber-300 gap-2">
      <Text className="text-base font-extrabold text-on-surface">IMPORTANTE</Text>
      {IMPORTANT_RULES.map((rule) => (
        <View key={rule.text} className="flex-row items-start gap-2">
          <Text className="text-base">{rule.icon}</Text>
          <Text className="flex-1 text-base text-on-surface">{rule.text}</Text>
        </View>
      ))}
    </View>
  );
}
