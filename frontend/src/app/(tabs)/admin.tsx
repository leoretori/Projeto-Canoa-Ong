/**
 * Painel de Gestão e Controle de Frota para Instrutores e Administradores Náuticos.
 * Redesenhado com o Design System Google Stitch (Canoa Para Todos).
 * Mantém 100% da integração com useSessions, DynamoDB atômico, roster de inscritos e admin roles.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { showAlert } from '../../utils/alert';
import { useSessions } from '../../hooks/useSessions';
import { api, Reservation, Session, AdminUser } from '../../services/api';
import { getCurrentUserRole } from '../../services/auth';

function exportRosterToCsv(session: Session, roster: Reservation[]) {
  const header = 'Nome,E-mail,Assento Adaptado,Status,Observações';
  const rows = roster.map((r) =>
    [r.user_name, r.user_email, r.requires_adapted_seat ? 'Sim' : 'Não', r.status, r.notes || '']
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [header, ...rows].join('\n');

  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `embarque-${session.date}-${session.time.replace(':', 'h')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    showAlert('Indisponível', 'Exportação de planilha CSV disponível apenas na versão Web.');
  }
}

const EMPTY_FORM = {
  date: '2026-10-28',
  time: '06:00',
  location: 'Praia Grande - São Sebastião',
  canoeType: 'Canoa OC6 (Ohana)',
  totalCapacity: '6',
  maxAdaptedSeats: '2',
  instructorName: 'Instrutor Kaique',
};

export default function AdminScreen() {
  const { sessions, loading, loadingMore, hasMore, error, createSession, refresh, loadMore } = useSessions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getCurrentUserRole().then((role) => setIsAdmin(role === 'ADMIN'));
  }, []);

  // Roster (lista de inscritos) por sessão
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [rosterCache, setRosterCache] = useState<Record<string, Reservation[]>>({});
  const [rosterLoading, setRosterLoading] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const toggleRoster = async (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      return;
    }
    setExpandedSessionId(sessionId);
    if (!rosterCache[sessionId]) {
      try {
        setRosterLoading(sessionId);
        const roster = await api.getSessionRoster(sessionId);
        setRosterCache((prev) => ({ ...prev, [sessionId]: roster }));
      } catch (err: any) {
        showAlert('Erro', err.message || 'Não foi possível carregar os inscritos desta remada.');
        setExpandedSessionId(null);
      } finally {
        setRosterLoading(null);
      }
    }
  };

  const handleToggleStatus = async (session: Session) => {
    const nextStatus = session.status === 'CANCELLED' ? 'OPEN' : 'CANCELLED';
    try {
      setStatusUpdating(session.session_id);
      await api.updateSessionStatus(session.session_id, nextStatus);
      refresh();
    } catch (err: any) {
      showAlert('Erro', err.message || 'Não foi possível alterar o status da remada.');
    } finally {
      setStatusUpdating(null);
    }
  };

  // Form states
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const openCreateModal = () => {
    setEditingSession(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (session: Session) => {
    setEditingSession(session);
    setForm({
      date: session.date,
      time: session.time,
      location: session.location,
      canoeType: session.canoe_type,
      totalCapacity: String(session.total_capacity),
      maxAdaptedSeats: String(session.max_adapted_seats),
      instructorName: session.instructor_name || '',
    });
    setModalVisible(true);
  };

  const handleSaveSession = async () => {
    if (!form.date || !form.time || !form.location) {
      showAlert('Erro', 'Preencha a data, horário e ponto de embarque.');
      return;
    }

    const payload = {
      date: form.date,
      time: form.time,
      location: form.location,
      canoe_type: form.canoeType,
      total_capacity: parseInt(form.totalCapacity, 10) || 6,
      max_adapted_seats: parseInt(form.maxAdaptedSeats, 10) || 2,
      instructor_name: form.instructorName,
    };

    try {
      setCreating(true);
      if (editingSession) {
        await api.updateSession(editingSession.session_id, payload);
        showAlert('Sucesso!', 'Dados da remada atualizados no sistema.');
      } else {
        await createSession(payload);
        showAlert('Sucesso!', 'Nova remada inclusiva cadastrada e aberta para inscrições.');
      }
      setModalVisible(false);
      refresh();
    } catch (err: any) {
      showAlert('Erro ao salvar remada', err.message || 'Verifique os dados informados.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-surface px-4 py-6"
      accessibilityLabel="Painel de Gestão e Controle de Frota Náutica"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#004e68', '#00687a']} />}
    >
      {error && (
        <View className="bg-error-container/60 border border-error p-3.5 rounded-2xl mb-4">
          <Text className="text-on-error-container text-sm font-semibold">{error}</Text>
        </View>
      )}

      {/* TOP COMMAND & ACTION BAR: STITCH DESIGN */}
      <View className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <View className="flex flex-col gap-1.5 max-w-2xl">
          <View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary self-start">
            <View className="w-2.5 h-2.5 rounded-full bg-secondary-container" />
            <Text className="text-xs font-bold text-primary uppercase tracking-wider">
              Controle Operacional da Guarderia • Mar Aberto
            </Text>
          </View>
          <Text className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight" accessibilityRole="header">
            Painel do Instrutor
          </Text>
          <Text className="text-sm md:text-base text-on-surface-variant leading-relaxed">
            Controle de frota, horários, tripulação e assentos adaptados em tempo real com conformidade de segurança e salvamento náutico.
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5 flex-wrap sm:flex-nowrap self-start lg:self-auto">
          <TouchableOpacity 
            onPress={refresh}
            className="h-12 px-4 rounded-xl bg-surface-container text-primary flex-row items-center justify-center gap-2 shadow-sm"
          >
            <Text className="text-base">🔄</Text>
            <Text className="text-xs font-bold text-primary">Atualizar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={openCreateModal}
            className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-container text-white flex-row items-center justify-center gap-2 shadow-sm"
            accessibilityRole="button"
            accessibilityLabel="Cadastrar nova remada"
          >
            <Text className="text-base">➕</Text>
            <Text className="text-white font-bold text-sm">+ Nova Remada</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AMBIENT PHOTO BANNER */}
      <View className="relative w-full rounded-3xl overflow-hidden shadow-sm bg-surface-container-low p-6 md:p-8 mb-6 border border-outline-variant/30 flex-row items-center justify-between">
        <View className="max-w-xl flex flex-col gap-1.5">
          <View className="px-2.5 py-0.5 rounded-md bg-secondary-container/40 self-start">
            <Text className="text-[11px] font-bold text-on-secondary-container uppercase tracking-wider">
              Guarderia Guardiã dos Mares
            </Text>
          </View>
          <Text className="text-lg md:text-xl font-extrabold text-primary">
            Equipamentos & Suporte em Prontidão
          </Text>
          <Text className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
            Canoas modelo OC6 estabilizadas com iacos e ama de flutuação positiva. Esteiras acessíveis estendidas na faixa de areia.
          </Text>
        </View>
        <View className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container items-center justify-center hidden sm:flex shrink-0">
          <Text className="text-3xl">🏄</Text>
        </View>
      </View>

      {/* QUICK MANAGEMENT GRID: USERS / ADMIN & RECENT ACTIVITIES */}
      <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column: Admin & Athletes Quick Management */}
        <View className="lg:col-span-7 bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <View>
            <View className="flex-row items-start justify-between gap-3 mb-4">
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center">
                  <Text className="text-xl">👥</Text>
                </View>
                <View>
                  <Text className="text-base font-bold text-on-surface">Gerenciar Usuários & Atletas</Text>
                  <Text className="text-xs text-on-surface-variant">Prontuários náuticos, fichas e níveis de autonomia</Text>
                </View>
              </View>
              <View className="px-2.5 py-1 rounded-full bg-surface-container-high">
                <Text className="text-[11px] font-bold text-primary">Gestão CPT</Text>
              </View>
            </View>

            {/* Quick Stats Pills */}
            <View className="grid grid-cols-3 gap-3 mb-4">
              <View className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <Text className="text-[11px] font-bold text-on-surface-variant">Alunos Ativos</Text>
                <Text className="text-xl font-extrabold text-primary mt-0.5">48</Text>
              </View>
              <View className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <Text className="text-[11px] font-bold text-on-surface-variant">Paratletas (PCD)</Text>
                <Text className="text-xl font-extrabold text-secondary mt-0.5">19</Text>
              </View>
              <View className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <Text className="text-[11px] font-bold text-on-surface-variant">Fichas Válidas</Text>
                <Text className="text-xl font-extrabold text-tertiary-container mt-0.5">100%</Text>
              </View>
            </View>

            {/* Admin Role Management if authorized */}
            {isAdmin && <UserManagementSection />}
          </View>

          <View className="pt-3 border-t border-outline-variant/20 flex-row items-center justify-between text-xs text-on-surface-variant">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs">🛡️</Text>
              <Text className="text-xs text-on-surface-variant font-medium">Protocolo de Segurança Médica Atualizado</Text>
            </View>
          </View>
        </View>

        {/* Right Column: Recent Activity Feed */}
        <View className="lg:col-span-5 bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <RecentActivitySection />
        </View>
      </View>

      {/* SCHEDULED OUTINGS FLEET CONTROL (REMADAS AGENDADAS) */}
      <View className="flex flex-col gap-4 mb-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg md:text-xl font-extrabold text-primary">
              Remadas Agendadas (Controle de Frota)
            </Text>
            <Text className="text-xs text-on-surface-variant">
              Gerenciamento de tripulação, assento adaptado e check-in na água
            </Text>
          </View>

          <View className="hidden sm:flex px-3 py-1.5 rounded-xl bg-surface-container-high text-primary flex-row items-center gap-1.5">
            <Text className="text-xs">📅</Text>
            <Text className="text-xs font-bold text-primary">Temporada Ativa</Text>
          </View>
        </View>

        {loading && sessions.length === 0 ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#004e68" />
            <Text className="text-on-surface-variant text-sm font-medium mt-3">Carregando frota...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 items-center text-center shadow-sm">
            <Text className="text-4xl mb-3">🛶</Text>
            <Text className="text-lg font-bold text-on-surface mb-1">Nenhuma remada cadastrada na frota</Text>
            <Text className="text-xs text-on-surface-variant mb-4">
              Toque no botão "+ Nova Remada" acima para abrir horários no calendário inclusivo.
            </Text>
          </View>
        ) : (
          sessions.map((session) => {
            const isFull = session.booked_seats >= session.total_capacity;
            const isCancelled = session.status === 'CANCELLED';
            const occupancyPercent = Math.min(100, Math.round((session.booked_seats / session.total_capacity) * 100));

            return (
              <View 
                key={session.session_id} 
                className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-5"
              >
                {/* Header Card */}
                <View className="flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
                  <View className="flex flex-col gap-1">
                    <View className="flex-row flex-wrap items-center gap-2">
                      <Text className="text-lg font-bold text-primary">
                        {session.date} • {session.time}
                      </Text>
                      <Text className="text-outline-variant">•</Text>
                      <Text className="text-xs font-bold text-on-surface">
                        {session.location} • Canoa {session.canoe_type}
                      </Text>
                    </View>
                    <Text className="text-xs text-on-surface-variant">
                      Saída monitorada • Condição: Ondulação suave de 0.4m, vento terral calmo (4 nós).
                    </Text>
                  </View>

                  <View className={`px-3 py-1 rounded-full self-start md:self-auto ${
                    isCancelled ? 'bg-rose-100' : isFull ? 'bg-amber-100' : 'bg-secondary-container/40'
                  }`}>
                    <Text className={`text-xs font-bold ${
                      isCancelled ? 'text-rose-800' : isFull ? 'text-amber-800' : 'text-on-secondary-container'
                    }`}>
                      {isCancelled ? 'CANCELADA' : isFull ? 'ESGOTADA' : 'ABERTA / OPEN'}
                    </Text>
                  </View>
                </View>

                {/* Metrics Overview Bento */}
                <View className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <View className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                    <Text className="text-[11px] font-bold text-on-surface-variant">Capacidade Geral</Text>
                    <View className="flex-row items-baseline gap-1.5 mt-0.5">
                      <Text className="text-lg font-extrabold text-primary">{session.booked_seats} / {session.total_capacity}</Text>
                      <Text className="text-[11px] text-on-surface-variant">remadores</Text>
                    </View>
                    <View className="w-full bg-surface-container h-1.5 rounded-full mt-2 overflow-hidden">
                      <View className="bg-primary h-full rounded-full" style={{ width: `${Math.max(5, occupancyPercent)}%` }} />
                    </View>
                  </View>

                  <View className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                    <Text className="text-[11px] font-bold text-secondary">♿ Assentos Adaptados</Text>
                    <View className="flex-row items-baseline gap-1.5 mt-0.5">
                      <Text className="text-lg font-extrabold text-secondary">{session.booked_adapted_seats} / {session.max_adapted_seats}</Text>
                      <Text className="text-[11px] text-on-surface-variant">ocupados</Text>
                    </View>
                    <Text className="text-[11px] text-on-surface-variant mt-1">
                      {session.max_adapted_seats - session.booked_adapted_seats} vagas com encosto fixo
                    </Text>
                  </View>

                  <View className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                    <Text className="text-[11px] font-bold text-on-surface-variant">Instrutor Responsável</Text>
                    <Text className="text-xs font-bold text-on-surface mt-0.5 truncate">
                      {session.instructor_name || 'Mestre Kaique'}
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant">Auxiliar náutico escalado</Text>
                  </View>

                  <View className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                    <Text className="text-[11px] font-bold text-on-surface-variant">Segurança Marítima</Text>
                    <Text className="text-xs font-bold text-primary mt-0.5">Barco de Apoio 01</Text>
                    <Text className="text-[10px] text-on-surface-variant">Rádio VHF Canal 16 Ativo</Text>
                  </View>
                </View>

                {/* Expandable Roster Accordion */}
                <TouchableOpacity
                  onPress={() => toggleRoster(session.session_id)}
                  className="bg-surface-container-low/60 rounded-2xl p-4 border border-outline-variant/20 flex-col"
                  accessibilityRole="button"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm">📋</Text>
                      <Text className="text-xs font-bold text-primary">
                        {expandedSessionId === session.session_id ? 'Ocultar Lista de Inscritos' : `Ver inscritos nesta canoa (${session.booked_seats} confirmados)`}
                      </Text>
                    </View>
                    <Text className="text-xs font-bold text-primary">
                      {expandedSessionId === session.session_id ? '▲' : '▼'}
                    </Text>
                  </View>

                  {expandedSessionId === session.session_id && (
                    <View className="mt-3 pt-3 border-t border-outline-variant/20">
                      {rosterLoading === session.session_id ? (
                        <ActivityIndicator size="small" color="#004e68" />
                      ) : (rosterCache[session.session_id]?.length ?? 0) === 0 ? (
                        <View className="py-4 items-center text-center">
                          <Text className="text-xs text-on-surface-variant font-medium">
                            Nenhum atleta inscrito nesta sessão até o momento. Vagas abertas para preenchimento.
                          </Text>
                        </View>
                      ) : (
                        <View className="flex flex-col gap-2">
                          {rosterCache[session.session_id].map((res) => (
                            <View 
                              key={res.reservation_id}
                              className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20"
                            >
                              <View className="flex-1 pr-2">
                                <Text className="text-xs font-bold text-on-surface">{res.user_name}</Text>
                                <Text className="text-[11px] text-on-surface-variant">{res.user_email}</Text>
                                {res.notes && (
                                  <Text className="text-[10px] text-primary mt-0.5">Obs: {res.notes}</Text>
                                )}
                              </View>
                              {res.requires_adapted_seat && (
                                <View className="px-2.5 py-1 rounded-full bg-secondary-container/40">
                                  <Text className="text-[10px] font-bold text-on-secondary-container">♿ Adaptado</Text>
                                </View>
                              )}
                            </View>
                          ))}

                          <TouchableOpacity
                            onPress={(e: any) => {
                              e.stopPropagation?.();
                              exportRosterToCsv(session, rosterCache[session.session_id]);
                            }}
                            className="mt-2 py-2.5 bg-surface-container rounded-xl flex-row items-center justify-center gap-1.5"
                          >
                            <Text className="text-xs">⬇</Text>
                            <Text className="text-xs font-bold text-primary">Exportar Planilha de Embarque (CSV)</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>

                {/* Bottom Action Buttons */}
                <View className="flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-outline-variant/20">
                  <View className="flex-row items-center gap-2 w-full sm:w-auto">
                    <TouchableOpacity
                      onPress={() => openEditModal(session)}
                      className="h-11 px-4 rounded-xl bg-surface-container text-primary flex-row items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                    >
                      <Text className="text-xs">✏️</Text>
                      <Text className="text-xs font-bold text-primary">Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => showAlert('Apoio e Coletes', `Canoa ${session.canoe_type} com ${session.max_adapted_seats} assentos adaptados homologados e coletes salva-vidas disponíveis.`)}
                      className="h-11 px-4 rounded-xl bg-surface-container text-primary flex-row items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                    >
                      <Text className="text-xs">🦺</Text>
                      <Text className="text-xs font-bold text-primary">Coletes / Assentos</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleToggleStatus(session)}
                    disabled={statusUpdating === session.session_id}
                    className={`h-11 px-5 rounded-xl flex-row items-center justify-center gap-1.5 w-full sm:w-auto ${
                      isCancelled ? 'bg-secondary-container/40' : 'bg-error-container/40'
                    }`}
                  >
                    {statusUpdating === session.session_id ? (
                      <ActivityIndicator size="small" color="#004e68" />
                    ) : (
                      <Text className={`text-xs font-bold ${isCancelled ? 'text-on-secondary-container' : 'text-error'}`}>
                        {isCancelled ? '✓ Reabrir Remada' : '✕ Cancelar Remada'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {hasMore && !loading && sessions.length > 0 && (
          <TouchableOpacity
            onPress={loadMore}
            disabled={loadingMore}
            className="py-3.5 items-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 mb-4 shadow-sm"
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color="#004e68" />
            ) : (
              <Text className="text-primary font-bold text-xs">Carregar mais remadas da frota</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* SUMMARY STATISTICS FOOTER BANNER */}
      <View className="bg-primary text-on-primary rounded-3xl p-6 md:p-8 shadow-md mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <View className="space-y-1 max-w-xl">
          <Text className="text-xs font-bold text-secondary-fixed uppercase tracking-wider">
            Resumo Diário da Operação Náutica
          </Text>
          <Text className="text-lg md:text-xl font-extrabold text-white">
            Status da Base e Equipamentos Inclusivos
          </Text>
          <Text className="text-xs text-surface-container leading-relaxed">
            Controle ativo de prontidão para garantir entrada e saída da água com acessibilidade total e segurança marítima.
          </Text>
        </View>

        <View className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <View className="bg-primary-container/80 p-3.5 rounded-2xl flex-row items-center gap-3">
            <Text className="text-2xl">🛶</Text>
            <View>
              <Text className="text-base font-bold text-white leading-tight">2 OC6</Text>
              <Text className="text-[11px] text-surface-container-high">Canoas na água</Text>
            </View>
          </View>

          <View className="bg-primary-container/80 p-3.5 rounded-2xl flex-row items-center gap-3">
            <Text className="text-2xl">🦺</Text>
            <View>
              <Text className="text-base font-bold text-white leading-tight">3 Coletes</Text>
              <Text className="text-[11px] text-surface-container-high">Adaptados prontos</Text>
            </View>
          </View>

          <View className="bg-primary-container/80 p-3.5 rounded-2xl flex-row items-center gap-3">
            <Text className="text-2xl">🏖️</Text>
            <View>
              <Text className="text-base font-bold text-white leading-tight">Instalada</Text>
              <Text className="text-[11px] text-surface-container-high">Esteira na areia</Text>
            </View>
          </View>
        </View>
      </View>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE REMADA */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-surface-container-lowest p-6 rounded-t-3xl max-h-[85%] border-t border-outline-variant/30">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">🛶</Text>
                <Text className="text-lg font-extrabold text-primary">
                  {editingSession ? 'Editar Detalhes da Remada' : 'Agendar Nova Remada Inclusiva'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-1">
                <Text className="text-gray-400 font-bold text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="space-y-4 mb-4">
              <View>
                <Text className="text-xs font-bold text-on-surface mb-1">Data (AAAA-MM-DD)</Text>
                <TextInput
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm"
                  value={form.date}
                  onChangeText={(v) => setForm((f) => ({ ...f, date: v }))}
                  placeholder="2026-10-28"
                />
              </View>

              <View className="mt-3">
                <Text className="text-xs font-bold text-on-surface mb-1">Horário de Embarque (HH:MM)</Text>
                <TextInput
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm"
                  value={form.time}
                  onChangeText={(v) => setForm((f) => ({ ...f, time: v }))}
                  placeholder="06:00"
                />
              </View>

              <View className="mt-3">
                <Text className="text-xs font-bold text-on-surface mb-1">Ponto de Embarque / Praia</Text>
                <TextInput
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm"
                  value={form.location}
                  onChangeText={(v) => setForm((f) => ({ ...f, location: v }))}
                />
              </View>

              <View className="grid grid-cols-2 gap-3 mt-3">
                <View>
                  <Text className="text-xs font-bold text-on-surface mb-1">Vagas Totais (máx. 12)</Text>
                  <TextInput
                    className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm"
                    value={form.totalCapacity}
                    onChangeText={(v) => setForm((f) => ({ ...f, totalCapacity: v }))}
                    keyboardType="numeric"
                  />
                </View>
                <View>
                  <Text className="text-xs font-bold text-secondary mb-1">♿ Vagas Adaptadas (máx. 4)</Text>
                  <TextInput
                    className="bg-secondary-container/30 border border-secondary-container rounded-xl px-4 py-3 text-primary font-bold text-sm"
                    value={form.maxAdaptedSeats}
                    onChangeText={(v) => setForm((f) => ({ ...f, maxAdaptedSeats: v }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="mt-3">
                <Text className="text-xs font-bold text-on-surface mb-1">Instrutor(a) Timoneiro(a)</Text>
                <TextInput
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm"
                  value={form.instructorName}
                  onChangeText={(v) => setForm((f) => ({ ...f, instructorName: v }))}
                />
              </View>
            </ScrollView>

            <View className="flex-row gap-3 pt-3 border-t border-outline-variant/20">
              <TouchableOpacity
                className="flex-1 py-3.5 bg-surface-container-low rounded-xl items-center border border-outline-variant/30"
                onPress={() => setModalVisible(false)}
                disabled={creating}
              >
                <Text className="text-on-surface-variant font-bold text-xs">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3.5 bg-primary rounded-xl items-center flex-row justify-center shadow-sm"
                onPress={handleSaveSession}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-xs">
                    {editingSession ? 'Salvar Alterações' : 'Salvar e Publicar Remada'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/** Feed de atividade recente da guarderia náutica */
function RecentActivitySection() {
  const [activity, setActivity] = useState<Reservation[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const load = async () => {
    try {
      setLoadingActivity(true);
      const data = await api.getRecentActivity();
      setActivity(data);
    } catch {
      // Silencioso para não interromper UI
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View className="flex flex-col justify-between flex-1">
      <View>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
              <Text className="text-lg">🔔</Text>
            </View>
            <View>
              <Text className="text-base font-bold text-on-surface">Atividade Recente</Text>
              <Text className="text-[11px] text-on-surface-variant">Últimas 24 horas na base</Text>
            </View>
          </View>
          <View className="px-2 py-0.5 rounded-full bg-primary/10">
            <Text className="text-[10px] font-bold text-primary">{activity.length} Eventos</Text>
          </View>
        </View>

        <View className="flex flex-col gap-2">
          {loadingActivity ? (
            <ActivityIndicator size="small" color="#004e68" />
          ) : activity.length === 0 ? (
            <View className="p-3 bg-surface-container-low/40 rounded-xl">
              <Text className="text-xs text-on-surface-variant text-center">Nenhuma nova inscrição nas últimas horas.</Text>
            </View>
          ) : (
            activity.slice(0, 4).map((res) => (
              <View key={res.reservation_id} className="p-2.5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/10 flex-row items-start gap-2.5">
                <Text className="text-base mt-0.5">👤</Text>
                <View className="flex-1">
                  <Text className="text-xs text-on-surface">
                    <Text className="font-bold">{res.user_name}</Text> se inscreveu na remada
                    {res.requires_adapted_seat ? ' (♿ adaptado)' : ''}.
                  </Text>
                  <Text className="text-[10px] text-on-surface-variant mt-0.5">
                    {new Date(res.created_at).toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}

/** Seção visível para role ADMIN: gerenciar papéis e permissões */
function UserManagementSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoadingUsers(true);
      const data = await api.adminListUsers();
      setUsers(data);
    } catch (err: any) {
      showAlert('Erro', err.message || 'Não foi possível carregar os usuários.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setRole = async (userId: string, role: AdminUser['role']) => {
    try {
      setUpdatingUserId(userId);
      await api.adminSetUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role } : u)));
      showAlert('Papel Alterado', `Usuário agora tem permissão de ${role}.`);
    } catch (err: any) {
      showAlert('Erro', err.message || 'Não foi possível alterar o role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const roleOptions: AdminUser['role'][] = ['ATHLETE', 'INSTRUCTOR', 'ADMIN'];

  return (
    <View className="mt-4 pt-4 border-t border-outline-variant/20">
      <Text className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
        Acesso de Administrador (Roles)
      </Text>
      {loadingUsers ? (
        <ActivityIndicator size="small" color="#004e68" />
      ) : (
        <View className="flex flex-col gap-2">
          {users.map((u) => (
            <View key={u.user_id} className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
              <Text className="text-xs font-bold text-on-surface">{u.name}</Text>
              <Text className="text-[10px] text-on-surface-variant mb-2">{u.email}</Text>
              <View className="flex-row gap-1.5">
                {roleOptions.map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(u.user_id, r)}
                    disabled={updatingUserId === u.user_id}
                    className={`px-2.5 py-1 rounded-full border ${
                      u.role === r ? 'bg-primary border-primary' : 'bg-surface-container border-outline-variant/30'
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${u.role === r ? 'text-white' : 'text-on-surface'}`}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
