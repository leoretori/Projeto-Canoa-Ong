/**
 * Minhas Remadas — vagas confirmadas do remador.
 * Premissa: público majoritariamente idoso. Só informação real (data, horário, local),
 * letras grandes e um botão claro para cancelar.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useReservations } from '../../hooks/useReservations';
import { showAlert } from '../../utils/alert';
import { Reservation } from '../../services/api';
import { formatSessionDate, formatTimeRange, todayIso } from '../../utils/date';

export default function MyReservationsScreen() {
  const router = useRouter();
  const { reservations, loading, error, cancelReservation, refresh } = useReservations();
  const [modalOrientacoes, setModalOrientacoes] = useState(false);

  // Só remadas de hoje em diante (as passadas não podem mais ser canceladas).
  const upcoming = reservations.filter((r) => !r.session_date || r.session_date >= todayIso());

  const doCancel = async (reservation: Reservation) => {
    try {
      await cancelReservation(reservation.session_id);
      showAlert('Vaga cancelada', 'Sua vaga foi liberada para outro remador.');
    } catch (err: any) {
      showAlert('Erro ao cancelar', err.message || 'Não foi possível cancelar a reserva.');
    }
  };

  const handleCancel = (reservation: Reservation) => {
    showAlert(
      'Cancelar vaga',
      `Tem certeza que quer cancelar sua vaga de ${formatSessionDate(reservation.session_date)}?`,
      [
        { text: 'Não, manter minha vaga', style: 'cancel' },
        { text: 'Sim, cancelar', style: 'destructive', onPress: () => doCancel(reservation) },
      ]
    );
  };

  const handleShare = async (reservation: Reservation) => {
    const when = reservation.session_date
      ? `${formatSessionDate(reservation.session_date)} às ${reservation.session_time}`
      : 'em breve';
    try {
      await Share.share({
        message: `Minha vaga está confirmada no Projeto Canoa Para Todos: ${when}${
          reservation.session_location ? `, ${reservation.session_location}` : ''
        }. 🛶🌊`,
      });
    } catch {
      // Usuário fechou o compartilhamento
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface px-4 py-6"
      contentContainerStyle={{ paddingBottom: 32 }}
      accessibilityLabel="Minhas remadas"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#004e68', '#00687a']} />}
    >
      {error && (
        <View className="bg-error-container/60 border border-error p-4 rounded-2xl mb-4">
          <Text className="text-on-error-container text-base font-semibold">{error}</Text>
        </View>
      )}

      <View className="flex-row flex-wrap items-center justify-between gap-3 mb-6">
        <View className="flex-1 min-w-[200px]">
          <Text className="text-3xl font-extrabold text-primary tracking-tight" accessibilityRole="header">
            Minhas Remadas
          </Text>
          <Text className="text-base text-on-surface-variant">Suas vagas confirmadas.</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          className="min-h-[52px] px-5 rounded-2xl bg-primary flex-row items-center justify-center gap-2"
          accessibilityRole="button"
          accessibilityLabel="Agendar nova remada"
        >
          <Text className="text-white font-bold text-base">📅 Agendar remada</Text>
        </TouchableOpacity>
      </View>

      {loading && upcoming.length === 0 ? (
        <View className="py-16 items-center">
          <ActivityIndicator size="large" color="#004e68" />
          <Text className="text-on-surface-variant text-base mt-3">Carregando suas vagas...</Text>
        </View>
      ) : upcoming.length === 0 ? (
        <View className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 items-center">
          <Text className="text-5xl mb-3">🛶</Text>
          <Text className="text-xl font-extrabold text-on-surface mb-2 text-center">Nenhuma vaga marcada</Text>
          <Text className="text-base text-on-surface-variant mb-6 text-center">
            Escolha um horário no calendário para garantir seu lugar na canoa.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="min-h-[52px] px-6 rounded-2xl bg-primary items-center justify-center"
          >
            <Text className="text-white font-bold text-base">Ver horários disponíveis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex flex-col gap-4">
          {upcoming.map((res) => {
            const cancelled = res.session_status === 'CANCELLED';
            return (
              <View
                key={res.reservation_id}
                className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden"
              >
                <View className={`h-2 w-full ${cancelled ? 'bg-error' : 'bg-primary'}`} />
                <View className="p-5 flex flex-col gap-4">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <View className={`px-3 py-1 rounded-full ${cancelled ? 'bg-error-container' : 'bg-secondary-container/50'}`}>
                      <Text className={`text-sm font-bold ${cancelled ? 'text-on-error-container' : 'text-on-secondary-container'}`}>
                        {cancelled ? 'Remada cancelada pela equipe' : '✓ Vaga confirmada'}
                      </Text>
                    </View>
                    {res.requires_adapted_seat && (
                      <View className="px-3 py-1 rounded-full bg-tertiary-fixed">
                        <Text className="text-sm font-bold text-on-tertiary-fixed-variant">♿ Assento adaptado</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex flex-col gap-2">
                    <Text className="text-2xl font-extrabold text-on-surface">
                      {res.session_date ? formatSessionDate(res.session_date) : 'Data a confirmar'}
                    </Text>
                    {res.session_time ? (
                      <Text className="text-lg font-bold text-primary">
                        🕖 {formatTimeRange(res.session_time, res.session_end_time)}
                      </Text>
                    ) : null}
                    {res.session_location ? (
                      <Text className="text-base text-on-surface">📍 {res.session_location}</Text>
                    ) : null}
                    <Text className="text-sm text-on-surface-variant">Chegue 30 minutos antes.</Text>
                  </View>

                  {res.notes ? (
                    <View className="p-3 rounded-xl bg-surface-container">
                      <Text className="text-sm text-on-surface-variant">Observação: {res.notes}</Text>
                    </View>
                  ) : null}

                  <View className="flex flex-col gap-2 pt-2">
                    <TouchableOpacity
                      onPress={() => setModalOrientacoes(true)}
                      className="min-h-[52px] rounded-2xl bg-surface-container items-center justify-center"
                    >
                      <Text className="text-base font-bold text-primary">Orientações de embarque</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleShare(res)}
                      className="min-h-[52px] rounded-2xl bg-surface-container items-center justify-center"
                    >
                      <Text className="text-base font-bold text-primary">📤 Compartilhar</Text>
                    </TouchableOpacity>
                    {!cancelled && (
                      <TouchableOpacity
                        onPress={() => handleCancel(res)}
                        className="min-h-[52px] rounded-2xl border-2 border-error items-center justify-center"
                        accessibilityRole="button"
                        accessibilityLabel="Cancelar minha vaga"
                      >
                        <Text className="text-base font-bold text-error">Cancelar minha vaga</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* MODAL: ORIENTAÇÕES DE EMBARQUE */}
      <Modal visible={modalOrientacoes} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <View className="w-full max-w-lg bg-surface-container-lowest p-6 rounded-3xl shadow-2xl border border-outline-variant/20">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">📋</Text>
                <Text className="text-xl font-extrabold text-primary">Guia Rápido de Embarque</Text>
              </View>
              <TouchableOpacity onPress={() => setModalOrientacoes(false)} className="p-1">
                <Text className="text-gray-400 font-bold text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <View className="flex flex-col gap-3.5 mb-6">
              <View className="flex-row items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white font-bold text-xs">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface">Chegada Antecipada (30 min)</Text>
                  <Text className="text-xs text-on-surface-variant leading-tight">Apresente-se na tenda principal da Guarderia Raia 1 para conferência de presença e hidratação.</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white font-bold text-xs">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface">Regulagem do Colete Salva-Vidas</Text>
                  <Text className="text-xs text-on-surface-variant leading-tight">Nossos lemes ajustam as fitas do colete ergonômico homologado pela Marinha para sua segurança.</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white font-bold text-xs">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface">Esteira de Praia & Transferência</Text>
                  <Text className="text-xs text-on-surface-variant leading-tight">Se você for cadeirante, nossa equipe realiza a condução segura pela esteira até o assento adaptado da canoa.</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white font-bold text-xs">4</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface">Navegação e Espírito Va'a</Text>
                  <Text className="text-xs text-on-surface-variant leading-tight">Todos no mesmo ritmo e respiração. Em caso de cansaço, apenas apoie o remo e aproveite o mar.</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setModalOrientacoes(false)}
              className="w-full h-12 rounded-xl bg-primary items-center justify-center shadow-sm"
            >
              <Text className="text-white font-bold text-sm">Entendido, estou pronto!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
