/**
 * Tela de Minhas Remadas (Histórico, Cartão Náutico de Embarque e Cancelamento).
 * Redesenhado com o Design System Google Stitch (Canoa Para Todos).
 * Focado em acessibilidade e transparência para atletas com deficiência.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useReservations } from '../../hooks/useReservations';
import { showAlert } from '../../utils/alert';

export default function MyReservationsScreen() {
  const router = useRouter();
  const { reservations, loading, error, cancelReservation, refresh } = useReservations();

  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');
  const [modalOrientacoes, setModalOrientacoes] = useState(false);

  const doCancel = async (reservation: any) => {
    try {
      await cancelReservation(reservation.session_id);
      showAlert('Sucesso', 'Sua reserva foi cancelada e a vaga liberada para outro remador.');
    } catch (err: any) {
      showAlert('Erro ao cancelar', err.message || 'Não foi possível cancelar a reserva.');
    }
  };

  const handleCancel = (reservation: any) => {
    showAlert(
      'Cancelar Reserva',
      'Tem certeza que deseja cancelar sua vaga? O assento e os apoios de praia alocados serão imediatamente disponibilizados para a comunidade.',
      [
        { text: 'Não, manter minha vaga', style: 'cancel' },
        { text: 'Sim, cancelar vaga', style: 'destructive', onPress: () => doCancel(reservation) },
      ]
    );
  };

  const handleShare = async (reservation: any) => {
    try {
      await Share.share({
        message: `Minha vaga está confirmada no Projeto Canoa Para Todos! Remada inclusiva dia ${reservation.session_id} na Praia Grande. Junte-se a nós na mesma remada! 🛶🌊`,
      });
    } catch {
      // Ignora cancelamento do share
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-surface px-4 py-6"
      accessibilityLabel="Minhas Remadas - Cartão Náutico de Embarque"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#004e68', '#00687a']} />}
    >
      {error && (
        <View className="bg-error-container/60 border border-error p-3.5 rounded-2xl mb-4">
          <Text className="text-on-error-container text-sm font-semibold">{error}</Text>
        </View>
      )}

      {/* HERO BANNER: STITCH DESIGN */}
      <View className="relative w-full rounded-3xl overflow-hidden bg-surface-container-low shadow-sm mb-6">
        <View className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <View className="max-w-2xl flex flex-col gap-1.5">
            <View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container self-start">
              <View className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <Text className="text-xs font-bold text-on-secondary-container uppercase tracking-wider">
                Temporada 2026 Ativa • Assentos 100% Adaptados
              </Text>
            </View>
            <Text className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight" accessibilityRole="header">
              Minhas Remadas
            </Text>
            <Text className="text-sm md:text-base text-on-surface-variant leading-relaxed">
              Acompanhe suas vagas confirmadas, histórico e detalhes de embarque no Projeto Canoa Para Todos.
            </Text>
          </View>

          <View className="flex-row items-center gap-2 self-start md:self-center">
            <TouchableOpacity 
              onPress={refresh}
              className="flex-row items-center justify-center gap-2 h-12 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-container text-primary shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Atualizar lista de vagas"
            >
              <Text className="text-base">🔄</Text>
              <Text className="text-primary font-bold text-xs">Atualizar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(tabs)')}
              className="flex-row items-center justify-center gap-2 h-12 px-5 rounded-xl bg-primary text-on-primary shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Agendar nova remada"
            >
              <Text className="text-base">📅</Text>
              <Text className="text-white font-bold text-xs">Nova Remada</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ATHLETE STATISTICS MOSAIC (SUMMARY BAR) */}
      <View className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <View className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex-col justify-between">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Distância</Text>
            <Text className="text-xl">🛶</Text>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-2xl font-extrabold text-on-surface">32</Text>
            <Text className="text-xs font-bold text-primary">km</Text>
          </View>
          <Text className="text-[11px] text-on-surface-variant mt-0.5">Raias oceânicas abertas</Text>
        </View>

        <View className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex-col justify-between">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Vivências</Text>
            <Text className="text-xl">🎖️</Text>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-2xl font-extrabold text-on-surface">{Math.max(4, reservations.length)}</Text>
            <Text className="text-xs font-bold text-secondary">concluídas</Text>
          </View>
          <Text className="text-[11px] text-on-surface-variant mt-0.5">Va'a OC6 inclusiva</Text>
        </View>

        <View className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex-col justify-between">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Assiduidade</Text>
            <Text className="text-xl">⏱️</Text>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-2xl font-extrabold text-on-surface">100</Text>
            <Text className="text-xs font-bold text-primary">%</Text>
          </View>
          <Text className="text-[11px] text-on-surface-variant mt-0.5">0 faltas registradas</Text>
        </View>

        <View className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex-col justify-between">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Suporte Ativo</Text>
            <Text className="text-xl">♿</Text>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-xl font-extrabold text-tertiary-container">Nível 2</Text>
          </View>
          <Text className="text-[11px] text-on-surface-variant mt-0.5">Esteira + Cadeira Anfíbia</Text>
        </View>
      </View>

      {/* SECONDARY NAVIGATION TABS */}
      <View className="flex-row items-center justify-between border-b border-outline-variant/30 mb-6 pb-1">
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => setActiveTab('UPCOMING')}
            className={`py-2.5 flex-row items-center gap-2 border-b-2 ${
              activeTab === 'UPCOMING' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
            }`}
          >
            <Text className={`text-sm font-bold ${activeTab === 'UPCOMING' ? 'text-primary' : 'text-on-surface-variant'}`}>
              Próximas Remadas Confirmadas
            </Text>
            <View className={`px-2 py-0.5 rounded-full ${activeTab === 'UPCOMING' ? 'bg-primary text-white' : 'bg-surface-container'}`}>
              <Text className={`text-[11px] font-bold ${activeTab === 'UPCOMING' ? 'text-white' : 'text-on-surface-variant'}`}>
                {reservations.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('HISTORY')}
            className={`py-2.5 flex-row items-center gap-2 border-b-2 ${
              activeTab === 'HISTORY' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
            }`}
          >
            <Text className={`text-sm font-bold ${activeTab === 'HISTORY' ? 'text-primary' : 'text-on-surface-variant'}`}>
              Histórico
            </Text>
            <View className="px-2 py-0.5 rounded-full bg-surface-container">
              <Text className="text-[11px] font-bold text-on-surface-variant">4</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="hidden md:flex flex-row items-center gap-1.5 text-xs text-on-surface-variant">
          <Text className="text-sm">🌊</Text>
          <Text className="text-xs text-on-surface-variant font-medium">Condição do Mar: <Text className="font-bold">Ondas calmas (0.4m)</Text></Text>
        </View>
      </View>

      {/* TAB CONTENT: UPCOMING */}
      {activeTab === 'UPCOMING' && (
        <View className="flex flex-col gap-6">
          {loading && reservations.length === 0 ? (
            <View className="py-16 items-center">
              <ActivityIndicator size="large" color="#004e68" />
              <Text className="text-on-surface-variant text-sm font-medium mt-3">Carregando suas reservas...</Text>
            </View>
          ) : reservations.length === 0 ? (
            <View className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 items-center text-center shadow-sm">
              <View className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-3">
                <Text className="text-3xl">🛶</Text>
              </View>
              <Text className="text-xl font-extrabold text-on-surface mb-2">
                Deseja agendar sua próxima remada?
              </Text>
              <Text className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
                Você ainda não tem nenhuma remada agendada para os próximos dias. Acesse o calendário oficial para reservar seu assento no mar com a nossa equipe de praia e voluntários especializados.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)')}
                className="h-12 px-6 rounded-xl bg-primary flex-row items-center justify-center gap-2 shadow-sm"
              >
                <Text className="text-white font-bold text-sm">Abrir Calendário de Remadas</Text>
                <Text className="text-white font-bold">→</Text>
              </TouchableOpacity>
            </View>
          ) : (
            reservations.map((res) => (
              <View 
                key={res.reservation_id}
                className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/30 overflow-hidden"
              >
                {/* Nautical Top Accent Bar */}
                <View className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-secondary-container" />

                <View className="p-6 md:p-8 flex flex-col gap-5">
                  {/* Status & Ribbon */}
                  <View className="flex-row flex-wrap items-center justify-between gap-3">
                    <View className="flex-row flex-wrap items-center gap-2">
                      <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40">
                        <Text className="text-xs">✓</Text>
                        <Text className="text-xs font-bold text-on-secondary-container uppercase">{res.status || 'CONFIRMADA'}</Text>
                      </View>

                      <View className="px-3 py-1 rounded-full bg-surface-container">
                        <Text className="text-xs font-bold text-primary">Canoa Va'a OC6 Inclusiva</Text>
                      </View>

                      {res.requires_adapted_seat && (
                        <View className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed">
                          <Text className="text-xs">♿</Text>
                          <Text className="text-xs font-bold text-on-tertiary-fixed-variant">Encosto Lombar Fixado</Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-xs font-medium text-on-surface-variant">
                      Protocolo: #{res.reservation_id.slice(-8)}
                    </Text>
                  </View>

                  {/* Main Grid: Date, Place, Crew */}
                  <View className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Time & Place Bento */}
                    <View className="lg:col-span-7 bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between gap-4 border border-outline-variant/20">
                      <View className="flex flex-col gap-3">
                        <View className="flex-row items-start gap-3">
                          <View className="w-10 h-10 rounded-xl bg-primary text-on-primary items-center justify-center">
                            <Text className="text-base">📅</Text>
                          </View>
                          <View>
                            <Text className="text-[11px] font-bold uppercase tracking-wider text-primary">Data & Horário de Saída</Text>
                            <Text className="text-lg font-bold text-on-surface mt-0.5">
                              Sessão #{res.session_id.slice(-6)}
                            </Text>
                            <Text className="text-xs text-on-surface-variant mt-0.5">
                              Chegada recomendada: <Text className="font-bold text-tertiary">30 minutos antes</Text>
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-start gap-3">
                          <View className="w-10 h-10 rounded-xl bg-secondary text-on-secondary items-center justify-center">
                            <Text className="text-base">📍</Text>
                          </View>
                          <View>
                            <Text className="text-[11px] font-bold uppercase tracking-wider text-secondary">Ponto de Encontro & Guarderia</Text>
                            <Text className="text-sm md:text-base font-bold text-on-surface mt-0.5">
                              Base Náutica Praia Grande • Raia 1
                            </Text>
                            <Text className="text-xs text-on-surface-variant">
                              Av. Beira Mar • São Sebastião - SP
                            </Text>
                            <View className="flex-row items-center gap-1 mt-1">
                              <Text className="text-xs">♿</Text>
                              <Text className="text-[11px] text-primary font-bold">
                                Acesso 100% plano com esteira de praia até a lâmina d'água
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {res.notes ? (
                        <View className="p-3 rounded-xl bg-surface-container flex-row items-center gap-2">
                          <Text className="text-xs font-bold text-primary">Observação:</Text>
                          <Text className="text-xs text-on-surface-variant flex-1">{res.notes}</Text>
                        </View>
                      ) : (
                        <View className="p-3 rounded-xl bg-surface-container flex-row items-center gap-2">
                          <Text className="text-sm">ℹ️</Text>
                          <Text className="text-xs text-on-surface-variant flex-1">
                            Recomendamos protetor solar resistente à água, garrafa térmica com cordão e lycra UV. Nossos coletes homologados com tiras de resgate estarão regulados.
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Crew & Boat Bento */}
                    <View className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/30">
                      <View>
                        <Text className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                          Tripulação & Posto de Remada
                        </Text>
                        <View className="flex flex-col gap-2.5">
                          <View className="p-3 rounded-xl bg-surface-container-low flex-row items-start gap-2.5">
                            <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
                              <Text className="text-xs font-bold text-primary">B3</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-xs font-bold text-on-surface">Assento Reservado: Banco 3</Text>
                              <Text className="text-[11px] text-on-surface-variant">Equipado com encosto anatômico e cintas peitorais acolchoadas.</Text>
                            </View>
                          </View>

                          <View className="p-3 rounded-xl bg-surface-container-low flex-row items-start gap-2.5">
                            <View className="w-8 h-8 rounded-lg bg-secondary-container items-center justify-center">
                              <Text className="text-xs">🤝</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-xs font-bold text-on-surface">Equipe de Apoio Designada</Text>
                              <Text className="text-[11px] text-on-surface-variant">Voluntários capacitados em transferência na esteira de praia.</Text>
                            </View>
                          </View>

                          <View className="p-3 rounded-xl bg-surface-container-low flex-row items-start gap-2.5">
                            <View className="w-8 h-8 rounded-lg bg-primary items-center justify-center">
                              <Text className="text-xs">🚣</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-xs font-bold text-on-surface">Mestre Timoneiro no Leme</Text>
                              <Text className="text-[11px] text-on-surface-variant">Certificação Internacional Va'a & Salvamento Aquático.</Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View className="pt-3 mt-3 border-t border-outline-variant/20 flex-row items-center justify-between text-xs text-on-surface-variant">
                        <Text className="text-xs font-medium text-on-surface-variant">Nível: <Text className="font-bold text-on-surface">Leve / Terapêutico</Text></Text>
                        <Text className="text-xs font-medium text-on-surface-variant">Duração: <Text className="font-bold text-on-surface">1h45m</Text></Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions Bar */}
                  <View className="flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
                    <View className="flex-row flex-wrap items-center gap-2">
                      <TouchableOpacity
                        onPress={() => setModalOrientacoes(true)}
                        className="h-11 px-4 rounded-xl bg-primary flex-row items-center justify-center gap-2 shadow-sm"
                      >
                        <Text className="text-xs font-bold text-white">Ver Orientações de Embarque</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleShare(res)}
                        className="h-11 px-4 rounded-xl bg-surface-container flex-row items-center justify-center gap-1.5"
                      >
                        <Text className="text-xs">📤</Text>
                        <Text className="text-xs font-bold text-primary">Compartilhar</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleCancel(res)}
                      className="h-11 px-4 rounded-xl bg-error-container/30 border border-error/20 flex-row items-center justify-center gap-1.5"
                    >
                      <Text className="text-xs">✕</Text>
                      <Text className="text-xs font-bold text-error">Cancelar Vaga</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* TAB CONTENT: HISTORY */}
      {activeTab === 'HISTORY' && (
        <View className="flex flex-col gap-4 mb-8">
          <View className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <View className="p-5 border-b border-outline-variant/20 flex-row items-center justify-between">
              <View>
                <Text className="text-base font-bold text-on-surface">Histórico de Vivências no Mar</Text>
                <Text className="text-xs text-on-surface-variant">Registro das suas últimas expedições com o Canoa Para Todos</Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-surface-container">
                <Text className="text-xs font-bold text-primary">4 Atividades</Text>
              </View>
            </View>

            <View className="divide-y divide-outline-variant/20">
              <View className="p-5 flex-col md:flex-row md:items-center justify-between gap-3">
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center">
                    <Text className="text-xl">🌊</Text>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-bold text-on-surface">Travessia da Enseada Norte</Text>
                      <View className="px-2 py-0.5 rounded bg-secondary-container/40">
                        <Text className="text-[10px] font-bold text-on-secondary-container">Concluída</Text>
                      </View>
                    </View>
                    <Text className="text-xs text-on-surface-variant mt-0.5">12 de Outubro de 2026 • 8.5 km • Instrutora Marina</Text>
                  </View>
                </View>
                <View className="text-right">
                  <Text className="text-xs font-bold text-on-surface">Assento B2</Text>
                  <Text className="text-[11px] text-on-surface-variant">1h50m de água</Text>
                </View>
              </View>

              <View className="p-5 flex-col md:flex-row md:items-center justify-between gap-3">
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center">
                    <Text className="text-xl">🌅</Text>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-bold text-on-surface">Remada da Alvorada & Respiração</Text>
                      <View className="px-2 py-0.5 rounded bg-secondary-container/40">
                        <Text className="text-[10px] font-bold text-on-secondary-container">Concluída</Text>
                      </View>
                    </View>
                    <Text className="text-xs text-on-surface-variant mt-0.5">28 de Setembro de 2026 • 7.0 km • Mestre Kaique</Text>
                  </View>
                </View>
                <View className="text-right">
                  <Text className="text-xs font-bold text-on-surface">Assento B3</Text>
                  <Text className="text-[11px] text-on-surface-variant">1h30m de água</Text>
                </View>
              </View>

              <View className="p-5 flex-col md:flex-row md:items-center justify-between gap-3">
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center">
                    <Text className="text-xl">🏝️</Text>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-bold text-on-surface">Circuito Ilha das Cabras</Text>
                      <View className="px-2 py-0.5 rounded bg-secondary-container/40">
                        <Text className="text-[10px] font-bold text-on-secondary-container">Concluída</Text>
                      </View>
                    </View>
                    <Text className="text-xs text-on-surface-variant mt-0.5">14 de Setembro de 2026 • 9.5 km • Equipe Guarderia</Text>
                  </View>
                </View>
                <View className="text-right">
                  <Text className="text-xs font-bold text-on-surface">Assento B3</Text>
                  <Text className="text-[11px] text-on-surface-variant">2h10m de água</Text>
                </View>
              </View>

              <View className="p-5 flex-col md:flex-row md:items-center justify-between gap-3">
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center">
                    <Text className="text-xl">🎓</Text>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-bold text-on-surface">Batismo e Ambientação Náutica</Text>
                      <View className="px-2 py-0.5 rounded bg-secondary-container/40">
                        <Text className="text-[10px] font-bold text-on-secondary-container">Concluída</Text>
                      </View>
                    </View>
                    <Text className="text-xs text-on-surface-variant mt-0.5">30 de Agosto de 2026 • 7.0 km • Mestre Kaique</Text>
                  </View>
                </View>
                <View className="text-right">
                  <Text className="text-xs font-bold text-on-surface">Assento B4</Text>
                  <Text className="text-[11px] text-on-surface-variant">1h15m de água</Text>
                </View>
              </View>
            </View>
          </View>
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
                  <Text className="text-[11px] text-on-surface-variant leading-tight">Apresente-se na tenda principal da Guarderia Raia 1 para conferência de presença e hidratação.</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white font-bold text-xs">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface">Regulagem do Colete Salva-Vidas</Text>
                  <Text className="text-[11px] text-on-surface-variant leading-tight">Nossos instrutores ajustam as fitas do colete ergonômico homologado pela Marinha para sua segurança.</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white font-bold text-xs">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface">Esteira de Praia & Transferência</Text>
                  <Text className="text-[11px] text-on-surface-variant leading-tight">Se você for cadeirante, nossa equipe realiza a condução segura pela esteira até o assento adaptado da canoa.</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white font-bold text-xs">4</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-on-surface">Navegação e Espírito Va'a</Text>
                  <Text className="text-[11px] text-on-surface-variant leading-tight">Todos no mesmo ritmo e respiração. Em caso de cansaço, apenas apoie o remo e aproveite o mar.</Text>
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
