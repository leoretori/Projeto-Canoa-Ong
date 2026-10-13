/**
 * Campos de data e hora fáceis de usar.
 * - Web (navegador do celular ou computador): usa o seletor nativo do navegador
 *   (calendário clicável / relógio), que já exibe no formato do idioma do aparelho (DD/MM/AAAA).
 * - App nativo: campo com máscara DD/MM/AAAA e HH:MM.
 * O valor trafega sempre em ISO (AAAA-MM-DD) e HH:MM.
 */

import React, { useEffect, useState } from 'react';
import { Platform, TextInput, View, Text } from 'react-native';
import { brToIso, isoToBr } from '../utils/date';

const webInputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 52,
  fontSize: 18,
  padding: '10px 14px',
  borderRadius: 14,
  border: '1px solid rgba(112,120,125,0.45)',
  background: 'transparent',
  color: 'inherit',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
}

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text className="text-sm font-bold text-on-surface mb-1.5">
      {label}
      {required ? <Text className="text-error"> *</Text> : null}
    </Text>
  );
}

const nativeInputClass =
  'w-full bg-surface-container-low border border-outline-variant/40 rounded-2xl px-4 py-3.5 text-lg text-on-surface';

function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function DateField({ label, value, onChange, required, min }: FieldProps) {
  const [text, setText] = useState(isoToBr(value));
  useEffect(() => setText(isoToBr(value)), [value]);

  if (Platform.OS === 'web') {
    return (
      <View>
        <Label label={label} required={required} />
        {React.createElement('input', {
          type: 'date',
          value,
          min,
          lang: 'pt-BR',
          'aria-label': label,
          onChange: (e: any) => onChange(e.target.value),
          style: webInputStyle,
        })}
        {value ? <Text className="text-xs text-on-surface-variant mt-1">{isoToBr(value)}</Text> : null}
      </View>
    );
  }

  return (
    <View>
      <Label label={label} required={required} />
      <TextInput
        className={nativeInputClass}
        placeholder="DD/MM/AAAA"
        keyboardType="number-pad"
        value={text}
        maxLength={10}
        accessibilityLabel={label}
        onChangeText={(t) => {
          const masked = maskDate(t);
          setText(masked);
          const iso = brToIso(masked);
          if (iso) onChange(iso);
        }}
      />
    </View>
  );
}

export function TimeField({ label, value, onChange, required }: FieldProps) {
  if (Platform.OS === 'web') {
    return (
      <View>
        <Label label={label} required={required} />
        {React.createElement('input', {
          type: 'time',
          value,
          'aria-label': label,
          onChange: (e: any) => onChange(e.target.value),
          style: webInputStyle,
        })}
      </View>
    );
  }

  return (
    <View>
      <Label label={label} required={required} />
      <TextInput
        className={nativeInputClass}
        placeholder="HH:MM"
        keyboardType="number-pad"
        value={value}
        maxLength={5}
        accessibilityLabel={label}
        onChangeText={(t) => onChange(maskTime(t))}
      />
    </View>
  );
}
