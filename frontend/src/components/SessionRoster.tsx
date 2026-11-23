/**
 * Lista de participantes de uma remada (visão do Leme):
 * inscritos + convidados, com indicadores de atenção, adicionar convidado e
 * retirar participante. Convidado ocupa vaga normalmente (mesma trava atômica).
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { api, Reservation, Session } from '../services/api';
import { showAlert } from '../utils/alert';

// Indicadores de atenção ao lado do nome do remador.
// Hoje só "assento adaptado" vem da reserva; os demais (não sabe nadar, doença
// preexistente, medo do mar) entram quando o cadastro completo for implementado.
export function attentionIcons(res: Reservation): { emoji: string; label: string }[] {
  const icons: { emoji: string; label: string }[] = [];
  if (res.requires_adapted_seat) icons.push({ emoji: '♿', label: 'Mobilidade reduzida / cadeirante' });
  return icons;
}

interface Props {
  session: Session;
  roster: Reservation[];
  onChanged: () => void; // recarrega lista e contadores
  onExport: () => void;
}

export function SessionRoster({ session, roster, onChanged, onExport }: Props) {
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAdapted, setGuestAdapted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isCancelled = session.status === 'CANCELLED';
  const isFull = session.booked_seats >= session.total_capacity;

  const resetForm = () => {
    setGuestName('');
    setGuestPhone('');
    setGuestAdapted(false);
  };

  const addGuest = async () => {
    if (guestName.trim().length < 2) {
      showAlert('Nome do convidado', 'Digite o nome do convidado.');
      return;
    }
    try {
      setSaving(true);
      await api.addGuest(session.session_id, {
        name: guestName.trim(),
        phone: guestPhone.trim() || undefined,
        requires_adapted_seat: guestAdapted,
      });
      resetForm();
      setShowGuestForm(false);
      onChanged();
    } catch (err: any) {
      showAlert('Convidado não adicionado', err.message || 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (res: Reservation) => {
    showAlert(
      'Retirar da remada',
      `Retirar ${res.user_name} desta remada? A vaga fica livre para outra pessoa.`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, retirar',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingId(res.user_id);
              await api.removeParticipant(session.session_id, res.user_id);
              onChanged();
            } catch (err: any) {
              showAlert('Erro', err.message || 'Não foi possível retirar.');
            } finally {
              setRemovingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex flex-col gap-2">
      {roster.length === 0 ? (
        <Text className="text-sm text-on-surface-variant py-2">Ninguém inscrito ainda.</Text>
      ) : (
        roster.map((res) => {
          const icons = attentionIcons(res);
          const attention = icons.length > 0;
          return (
            <View
              key={res.reservation_id}
              className={`flex-row items-center gap-2 p-3 rounded-xl border ${
                attention ? 'bg-amber-50 border-amber-400' : 'bg-surface-container-lowest border-outline-variant/30'
              }`}
            >
              <View className="flex-1">
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <Text className="text-sm font-bold text-on-surface">{res.user_name}</Text>
                  {res.is_guest ? (
                    <View className="px-2 py-0.5 rounded-full bg-secondary-container/50">
                      <Text className="text-xs font-bold text-on-secondary-container">Convidado</Text>
                    </View>
                  ) : null}
                  {icons.map((icon) => (
                    <Text key={icon.emoji} className="text-base" accessibilityLabel={icon.label}>
                      {icon.emoji}
                    </Text>
                  ))}
                </View>
                {res.is_guest ? (
                  <Text className="text-xs text-on-surface-variant">
                    {res.guest_phone ? `📞 ${res.guest_phone}` : 'Sem telefone'}
                    {res.added_by ? ` • convidado por ${res.added_by}` : ''}
                  </Text>
                ) : res.user_email ? (
                  <Text className="text-xs text-on-surface-variant">{res.user_email}</Text>
                ) : null}
                {res.notes ? <Text className="text-xs text-primary mt-0.5">Obs: {res.notes}</Text> : null}
              </View>
              <TouchableOpacity
                onPress={() => remove(res)}
                disabled={removingId === res.user_id}
                className="min-h-[44px] px-3 rounded-xl items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={`Retirar ${res.user_name} da remada`}
              >
                {removingId === res.user_id ? (
                  <ActivityIndicator size="small" color="#ba1a1a" />
                ) : (
                  <Text className="text-sm font-bold" style={{ color: "#ba1a1a" }}>Retirar</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })
      )}

      {/* ADICIONAR CONVIDADO */}
      {!isCancelled && (
        showGuestForm ? (
          <View className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 gap-2">
            <Text className="text-sm font-bold text-on-surface">Novo convidado</Text>
            <TextInput
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3 py-3 text-on-surface text-base"
              placeholder="Nome do convidado"
              placeholderTextColor="#70787e"
              value={guestName}
              onChangeText={setGuestName}
              accessibilityLabel="Nome do convidado"
            />
            <TextInput
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3 py-3 text-on-surface text-base"
              placeholder="Celular (opcional)"
              placeholderTextColor="#70787e"
              value={guestPhone}
              onChangeText={setGuestPhone}
              keyboardType="phone-pad"
              accessibilityLabel="Celular do convidado"
            />
            <TouchableOpacity
              onPress={() => setGuestAdapted((v) => !v)}
              className="flex-row items-center gap-2 min-h-[44px]"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: guestAdapted }}
            >
              <View
                className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
                  guestAdapted ? 'bg-primary border-primary' : 'border-outline'
                }`}
              >
                {guestAdapted ? <Text className="text-white text-xs font-bold">✓</Text> : null}
              </View>
              <Text className="text-sm text-on-surface">♿ Precisa de assento adaptado</Text>
            </TouchableOpacity>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setShowGuestForm(false);
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-surface-container items-center justify-center"
              >
                <Text className="text-sm font-bold text-on-surface-variant">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addGuest}
                disabled={saving}
                className="flex-1 min-h-[44px] rounded-xl bg-primary items-center justify-center"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-sm font-bold text-white">Adicionar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowGuestForm(true)}
            disabled={isFull}
            className={`min-h-[44px] rounded-xl items-center justify-center border border-dashed ${
              isFull ? 'border-outline-variant/40' : 'border-primary'
            }`}
            accessibilityRole="button"
          >
            <Text className={`text-sm font-bold ${isFull ? 'text-outline' : 'text-primary'}`}>
              {isFull ? 'Remada lotada' : '➕ Adicionar convidado'}
            </Text>
          </TouchableOpacity>
        )
      )}

      {roster.length > 0 ? (
        <TouchableOpacity
          onPress={onExport}
          className="min-h-[44px] rounded-xl bg-surface-container items-center justify-center"
        >
          <Text className="text-sm font-bold text-primary">⬇ Baixar lista de embarque (CSV)</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
