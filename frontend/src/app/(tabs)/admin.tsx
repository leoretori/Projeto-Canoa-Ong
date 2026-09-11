/**
 * Painel de Gestão e Criação de Remadas para Instrutores.
 * Gerenciado pelo Subagent 2 (Front-End/UI).
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
    link.download = `inscritos-${session.date}-${session.time}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    showAlert('Indisponível', 'Exportação de CSV disponível apenas na versão web por enquanto.');
  }
}

const EMPTY_FORM = {
  date: '2026-10-28',
  time: '06:00',
  location: 'Praia Grande - São Sebastião',
  canoeType: 'OC6',
  totalCapacity: '6',
  maxAdaptedSeats: '2',
  instructorName: 'Instrutor CPT',
};

export default function AdminScreen() {
  const { sessions, loading, loadingMore, hasMore, error, createSession, refresh, loadMore } = useSessions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getCurrentUserRole().then((role) => setIsAdmin(role === 'ADMIN'));
  }, []);

  // Roster (lista de inscritos) por sessão, carregado sob demanda ao expandir
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
        showAlert('Erro', err.message || 'Não foi possível carregar os inscritos.');
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

  // Form states (compartilhado entre criar e editar)
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
      showAlert('Erro', 'Preencha todos os campos obrigatórios.');
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
        showAlert('Sucesso!', 'Remada atualizada.');
      } else {
        await createSession(payload);
        showAlert('Sucesso!', 'Nova remada inclusiva cadastrada no calendário.');
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
      className="flex-1 bg-gray-50 dark:bg-gray-950 px-4 py-6"
      accessibilityLabel="Painel de gestão de remadas"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#0E7490']} />}
    >
      {error && (
        <View className="bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4">
          <Text className="text-rose-700 text-sm font-medium">{error}</Text>
        </View>
      )}

      <View className="mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50 dark:text-white" accessibilityRole="header">
            Painel do Instrutor
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 dark:text-gray-400">
            Controle de frota, horários e assentos adaptados.
          </Text>
        </View>
        <TouchableOpacity 
          className="bg-primary-700 px-4 py-2.5 rounded-xl flex-row items-center shadow-sm"
          onPress={openCreateModal}
          accessibilityRole="button"
          accessibilityLabel="Cadastrar nova remada"
        >
          <Text className="text-white font-bold text-sm">+ Nova Remada</Text>
        </TouchableOpacity>
      </View>

      {isAdmin && <UserManagementSection />}

      <RecentActivitySection />

      {loading && sessions.length === 0 ? (
        <View className="py-12 items-center">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="text-gray-500 dark:text-gray-400 mt-2">Carregando painel...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 items-center my-6">
          <Text className="text-4xl mb-2">🗓️</Text>
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 dark:text-gray-100 mb-1">Nenhuma remada cadastrada</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center text-sm mb-4">
            Toque em "+ Nova Remada" para abrir o calendário para os atletas.
          </Text>
        </View>
      ) : (
        sessions.map((session) => (
          <View key={session.session_id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <TouchableOpacity
              onPress={() => toggleRoster(session.session_id)}
              accessibilityRole="button"
              accessibilityLabel="Ver lista de inscritos desta remada"
            >
              <View className="flex-row justify-between mb-3 border-b border-gray-100 pb-3 items-center">
                <View>
                  <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">{session.date} - {session.time}</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{session.location} • {session.canoe_type}</Text>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${session.status === 'FULL' ? 'bg-rose-100' : session.status === 'CANCELLED' ? 'bg-gray-200' : 'bg-emerald-100'}`}>
                  <Text className={`text-xs font-bold ${session.status === 'FULL' ? 'text-rose-700' : session.status === 'CANCELLED' ? 'text-gray-600 dark:text-gray-400' : 'text-emerald-700'}`}>
                    {session.status}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between mb-4">
                <View className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex-1 mr-2">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">Capacidade Geral</Text>
                  <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 dark:text-gray-100">{session.booked_seats} / {session.total_capacity}</Text>
                </View>
                <View className="bg-primary-50 p-3 rounded-xl flex-1 ml-2">
                  <Text className="text-xs text-primary-700">♿ Assentos Adaptados</Text>
                  <Text className="text-lg font-bold text-primary-800">{session.booked_adapted_seats} / {session.max_adapted_seats}</Text>
                </View>
              </View>

              <Text className="text-xs text-primary-700 font-medium text-center">
                {expandedSessionId === session.session_id ? '▲ Ocultar inscritos' : '▼ Ver quem se inscreveu'}
              </Text>

              {expandedSessionId === session.session_id && (
                <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {rosterLoading === session.session_id ? (
                    <ActivityIndicator size="small" color="#0E7490" />
                  ) : (rosterCache[session.session_id]?.length ?? 0) === 0 ? (
                    <Text className="text-gray-400 dark:text-gray-500 text-sm text-center py-2">Ninguém inscrito ainda.</Text>
                  ) : (
                    <>
                      {rosterCache[session.session_id].map((res) => (
                        <View 
                          key={res.reservation_id} 
                          className="flex-row justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                        >
                          <View className="flex-1 pr-2">
                            <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100 dark:text-gray-100">{res.user_name}</Text>
                            <Text className="text-xs text-gray-400 dark:text-gray-500">{res.user_email}</Text>
                          </View>
                          {res.requires_adapted_seat && (
                            <View className="bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full">
                              <Text className="text-xs font-bold text-primary-800">♿ Adaptado</Text>
                            </View>
                          )}
                        </View>
                      ))}
                      <TouchableOpacity
                        className="mt-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg items-center"
                        onPress={(e: any) => {
                          e.stopPropagation?.();
                          exportRosterToCsv(session, rosterCache[session.session_id]);
                        }}
                      >
                        <Text className="text-xs font-bold text-gray-600 dark:text-gray-400 dark:text-gray-300">⬇ Exportar lista (CSV)</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>

            <View className="flex-row gap-2 mt-4 pt-3 border-t border-gray-100">
              <TouchableOpacity
                className="flex-1 py-2.5 bg-gray-100 rounded-lg items-center"
                onPress={() => openEditModal(session)}
              >
                <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2.5 rounded-lg items-center ${session.status === 'CANCELLED' ? 'bg-emerald-50' : 'bg-rose-50'}`}
                onPress={() => handleToggleStatus(session)}
                disabled={statusUpdating === session.session_id}
              >
                {statusUpdating === session.session_id ? (
                  <ActivityIndicator size="small" color="#0E7490" />
                ) : (
                  <Text className={`text-xs font-bold ${session.status === 'CANCELLED' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {session.status === 'CANCELLED' ? 'Reabrir' : 'Cancelar Remada'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {hasMore && !loading && sessions.length > 0 && (
        <TouchableOpacity
          onPress={loadMore}
          disabled={loadingMore}
          className="py-3 items-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-4"
        >
          {loadingMore ? (
            <ActivityIndicator size="small" color="#0E7490" />
          ) : (
            <Text className="text-primary-700 dark:text-primary-300 font-medium text-sm">Carregar mais remadas</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Modal de Criação/Edição de Remada */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-900 p-6 rounded-t-3xl max-h-[85%]">
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              {editingSession ? 'Editar Remada' : 'Cadastrar Nova Remada'}
            </Text>

            <ScrollView className="space-y-4 mb-4">
              <View>
                <Text className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Data (YYYY-MM-DD)</Text>
                <TextInput
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100"
                  value={form.date}
                  onChangeText={(v) => setForm((f) => ({ ...f, date: v }))}
                  placeholder="2026-10-28"
                />
              </View>

              <View className="mt-3">
                <Text className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Horário (HH:MM)</Text>
                <TextInput
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100"
                  value={form.time}
                  onChangeText={(v) => setForm((f) => ({ ...f, time: v }))}
                  placeholder="06:00"
                />
              </View>

              <View className="mt-3">
                <Text className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Local de Saída</Text>
                <TextInput
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100"
                  value={form.location}
                  onChangeText={(v) => setForm((f) => ({ ...f, location: v }))}
                />
              </View>

              <View className="flex-row gap-3 mt-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Vagas Totais (máx. 12)</Text>
                  <TextInput
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100"
                    value={form.totalCapacity}
                    onChangeText={(v) => setForm((f) => ({ ...f, totalCapacity: v }))}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-primary-700 mb-1">♿ Vagas Adaptadas (máx. 4)</Text>
                  <TextInput
                    className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 font-bold"
                    value={form.maxAdaptedSeats}
                    onChangeText={(v) => setForm((f) => ({ ...f, maxAdaptedSeats: v }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="mt-3">
                <Text className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nome do(a) Instrutor(a)</Text>
                <TextInput
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100"
                  value={form.instructorName}
                  onChangeText={(v) => setForm((f) => ({ ...f, instructorName: v }))}
                />
              </View>
            </ScrollView>

            <View className="flex-row gap-3 pt-2 border-t border-gray-100">
              <TouchableOpacity
                className="flex-1 py-3.5 bg-gray-100 rounded-xl items-center"
                onPress={() => setModalVisible(false)}
                disabled={creating}
              >
                <Text className="text-gray-700 dark:text-gray-300 font-medium">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3.5 bg-primary-700 rounded-xl items-center flex-row justify-center"
                onPress={handleSaveSession}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold">{editingSession ? 'Salvar Alterações' : 'Salvar Remada'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/** Feed de atividade recente — substitui notificação push (que exigiria token de
 * dispositivo e infra de envio). O Instrutor confere aqui as últimas inscrições. */
function RecentActivitySection() {
  const [expanded, setExpanded] = useState(true);
  const [activity, setActivity] = useState<Reservation[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const load = async () => {
    try {
      setLoadingActivity(true);
      const data = await api.getRecentActivity();
      setActivity(data);
    } catch (err: any) {
      // Silencioso — atividade recente é conveniência, não crítica.
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <TouchableOpacity onPress={() => setExpanded((v) => !v)} className="p-4 flex-row justify-between items-center">
        <Text className="font-bold text-gray-800 dark:text-gray-100 dark:text-gray-100">🔔 Atividade Recente</Text>
        <Text className="text-primary-700 dark:text-primary-300 text-xs font-bold">{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4">
          {loadingActivity ? (
            <ActivityIndicator size="small" color="#0E7490" />
          ) : activity.length === 0 ? (
            <Text className="text-gray-400 dark:text-gray-500 text-sm text-center py-2">Nenhuma inscrição recente.</Text>
          ) : (
            activity.map((res) => (
              <View key={res.reservation_id} className="py-2 border-t border-gray-50 dark:border-gray-800">
                <Text className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-200">
                  <Text className="font-semibold">{res.user_name}</Text> se inscreveu
                  {res.requires_adapted_seat ? ' (♿ assento adaptado)' : ''}
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">{new Date(res.created_at).toLocaleString('pt-BR')}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

/** Seção visível só para role ADMIN: promover/rebaixar usuários. */
function UserManagementSection() {
  const [expanded, setExpanded] = useState(false);
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

  const toggle = () => {
    setExpanded((v) => !v);
    if (!expanded && users.length === 0) load();
  };

  const setRole = async (userId: string, role: AdminUser['role']) => {
    try {
      setUpdatingUserId(userId);
      await api.adminSetUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role } : u)));
    } catch (err: any) {
      showAlert('Erro', err.message || 'Não foi possível alterar o role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const roleOptions: AdminUser['role'][] = ['ATHLETE', 'INSTRUCTOR', 'ADMIN'];

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <TouchableOpacity onPress={toggle} className="p-4 flex-row justify-between items-center">
        <Text className="font-bold text-gray-800 dark:text-gray-100">👤 Gerenciar Usuários (Admin)</Text>
        <Text className="text-primary-700 text-xs font-bold">{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4">
          {loadingUsers ? (
            <ActivityIndicator size="small" color="#0E7490" />
          ) : (
            users.map((u) => (
              <View key={u.user_id} className="py-3 border-t border-gray-50">
                <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">{u.name}</Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500 mb-2">{u.email}</Text>
                <View className="flex-row gap-2">
                  {roleOptions.map((r) => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setRole(u.user_id, r)}
                      disabled={updatingUserId === u.user_id}
                      className={`px-3 py-1.5 rounded-full border ${u.role === r ? 'bg-primary-700 border-primary-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                    >
                      <Text className={`text-xs font-medium ${u.role === r ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}
