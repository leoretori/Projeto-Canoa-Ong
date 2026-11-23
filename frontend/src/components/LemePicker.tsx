/**
 * Escolha dos lemes da remada: mostra os lemes cadastrados como botões (toque para
 * marcar/desmarcar) e permite incluir um nome que ainda não tem cadastro.
 * Aceita mais de um leme por remada.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { api, LemeOption } from '../services/api';

const MAX_LEMES = 6;

// Lista carregada uma vez por sessão do app (não muda a cada abertura do formulário).
let cachedLemes: LemeOption[] | null = null;

interface Props {
  value: string[];
  onChange: (lemes: string[]) => void;
}

export function LemePicker({ value, onChange }: Props) {
  const [options, setOptions] = useState<LemeOption[]>(cachedLemes || []);
  const [loading, setLoading] = useState(!cachedLemes);
  const [loadError, setLoadError] = useState(false);
  const [otherName, setOtherName] = useState('');

  useEffect(() => {
    if (cachedLemes) return;
    api
      .listLemes()
      .then((data) => {
        cachedLemes = data;
        setOptions(data);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const isSelected = (name: string) => value.some((v) => v.toLowerCase() === name.toLowerCase());

  const toggle = (name: string) => {
    if (isSelected(name)) {
      onChange(value.filter((v) => v.toLowerCase() !== name.toLowerCase()));
    } else if (value.length < MAX_LEMES) {
      onChange([...value, name]);
    }
  };

  const addOther = () => {
    const name = otherName.trim();
    if (name.length < 2 || isSelected(name) || value.length >= MAX_LEMES) return;
    onChange([...value, name]);
    setOtherName('');
  };

  // Nomes escolhidos que não estão na lista de cadastrados (ex.: digitados à mão)
  const extraSelected = value.filter((v) => !options.some((o) => o.name.toLowerCase() === v.toLowerCase()));
  const chips = [...options.map((o) => o.name), ...extraSelected];

  return (
    <View>
      <Text className="text-sm font-bold text-on-surface mb-0.5">Lemes da remada</Text>
      <Text className="text-xs text-on-surface-variant mb-2">
        Toque para escolher. Pode marcar mais de um.
      </Text>

      {loading ? (
        <ActivityIndicator size="small" color="#004e68" />
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {chips.map((name) => {
            const selected = isSelected(name);
            return (
              <TouchableOpacity
                key={name}
                onPress={() => toggle(name)}
                className={`min-h-[44px] px-4 rounded-full flex-row items-center gap-2 border ${
                  selected ? 'bg-primary border-primary' : 'bg-surface-container-low border-outline-variant/40'
                }`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`Leme ${name}`}
              >
                <Text className="text-base">🧭</Text>
                <Text className={`text-sm font-bold ${selected ? 'text-white' : 'text-on-surface'}`}>{name}</Text>
                {selected ? <Text className="text-sm font-bold text-white">✓</Text> : null}
              </TouchableOpacity>
            );
          })}
          {chips.length === 0 ? (
            <Text className="text-xs text-on-surface-variant">
              {loadError ? 'Não foi possível carregar os lemes cadastrados.' : 'Nenhum leme cadastrado ainda.'}
            </Text>
          ) : null}
        </View>
      )}

      <View className="flex-row gap-2 mt-3">
        <TextInput
          className="flex-1 bg-surface-container-low border border-outline-variant/40 rounded-2xl px-4 py-3 text-on-surface text-base"
          placeholder="Outro leme (sem cadastro)"
          placeholderTextColor="#70787e"
          value={otherName}
          onChangeText={setOtherName}
          onSubmitEditing={addOther}
          accessibilityLabel="Nome de outro leme"
        />
        <TouchableOpacity
          onPress={addOther}
          className="px-4 rounded-2xl bg-surface-container items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Adicionar outro leme"
        >
          <Text className="text-sm font-bold text-primary">Adicionar</Text>
        </TouchableOpacity>
      </View>
      {value.length >= MAX_LEMES ? (
        <Text className="text-xs text-on-surface-variant mt-1">Máximo de {MAX_LEMES} lemes por remada.</Text>
      ) : null}
    </View>
  );
}

/** Lemes de uma remada, compatível com remadas antigas (só instructor_name em texto). */
export function sessionLemes(session: { lemes?: string[]; instructor_name?: string }): string[] {
  if (session.lemes && session.lemes.length) return session.lemes;
  return (session.instructor_name || '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
}
