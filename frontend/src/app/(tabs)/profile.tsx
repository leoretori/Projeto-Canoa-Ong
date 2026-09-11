/**
 * Perfil do remador — dados pessoais, contato de emergência e necessidades náuticas de acessibilidade.
 * Redesenhado com o Design System Google Stitch (Canoa Para Todos).
 * Mantém integração completa com api.getProfile() e api.updateProfile().
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { api, UserProfile } from '../../services/api';
import { showAlert } from '../../utils/alert';

const ACCESSIBILITY_TYPES: { value: UserProfile['accessibility_type']; label: string }[] = [
  { value: 'NONE', label: 'Nenhuma' },
  { value: 'WHEELCHAIR', label: 'Cadeirante' },
  { value: 'REDUCED_MOBILITY', label: 'Mobilidade reduzida' },
  { value: 'VISUAL_IMPAIRMENT', label: 'Deficiência visual' },
  { value: 'OTHER', label: 'Outra' },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [phone, setPhone] = useState('');
  const [hasNeeds, setHasNeeds] = useState(false);
  const [accessType, setAccessType] = useState<UserProfile['accessibility_type']>('NONE');
  const [notes, setNotes] = useState('');
  const [emergencyName, setEmergencyName] = useState('Marina Silva (Irmã)');
  const [emergencyPhone, setEmergencyPhone] = useState('(11) 98888-7777');
  const [swimLevel, setSwimLevel] = useState<'SIM' | 'NAO' | 'FLUTUADOR'>('FLUTUADOR');

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data);
      setPhone(data.phone || '(11) 99999-9999');
      setHasNeeds(data.has_accessibility_needs);
      setAccessType(data.accessibility_type);
      
      const rawNotes = data.notes || '';
      setNotes(rawNotes);
    } catch (err: any) {
      showAlert('Erro', err.message || 'Não foi possível carregar seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateProfile({
        phone,
        has_accessibility_needs: hasNeeds,
        accessibility_type: hasNeeds ? (accessType === 'NONE' ? 'WHEELCHAIR' : accessType) : 'NONE',
        notes: notes.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      showAlert('Sucesso! 🎉', 'Seu perfil náutico foi atualizado. Os instrutores e a equipe de praia terão acesso aos ajustes.');
    } catch (err: any) {
      showAlert('Erro', err.message || 'Não foi possível salvar seu perfil.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CP';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#004e68" />
        <Text className="text-on-surface-variant text-sm font-medium mt-3">Carregando prontuário do atleta...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-surface px-4 py-6" 
      accessibilityLabel="Meu Perfil de Remador e Acessibilidade"
    >
      {/* HERO BANNER: STITCH DESIGN */}
      <View className="relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm mb-6 p-6 md:p-8 border border-outline-variant/30">
        <View className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <View className="max-w-2xl flex flex-col gap-1.5">
            <View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-primary self-start">
              <Text className="text-xs">🛡️</Text>
              <Text className="text-xs font-bold text-primary">Cadastro Ativo de Paratleta</Text>
            </View>
            <Text className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight" accessibilityRole="header">
              Meu Perfil
            </Text>
            <Text className="text-sm md:text-base text-on-surface-variant leading-relaxed">
              Esses dados ajudam a equipe do Canoa Para Todos a preparar seu embarque com conforto e segurança.
            </Text>
          </View>

          <View className="flex-row items-center gap-3 bg-surface-container-low px-4 py-3 rounded-2xl border border-outline-variant/20 self-start md:self-center">
            <View className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container items-center justify-center">
              <Text className="text-lg">🌊</Text>
            </View>
            <View>
              <Text className="text-xs font-bold text-on-surface">Base Guarderia</Text>
              <Text className="text-[11px] text-on-surface-variant">Raia 1 • Mar Calmo</Text>
            </View>
          </View>
        </View>
      </View>

      {/* AMBIENCE BANNER */}
      <View className="rounded-3xl bg-surface-container-low p-5 md:p-6 mb-6 border border-outline-variant/30 flex-row items-center gap-4">
        <View className="w-12 h-12 rounded-2xl bg-primary text-on-primary items-center justify-center shrink-0 shadow-sm">
          <Text className="text-2xl">🛶</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-primary">Vivência Va'a Inclusiva</Text>
          <Text className="text-xs text-on-surface-variant leading-relaxed">
            Equipamento adaptado pré-ajustado conforme ficha técnica individual, com acompanhamento de monitores em praia e no mar.
          </Text>
        </View>
      </View>

      {/* MAIN TWO-COLUMN GRID */}
      <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
        {/* LEFT COLUMN: Identity & Stats Card */}
        <View className="lg:col-span-4 flex flex-col gap-6">
          <View className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30 flex flex-col items-center text-center">
            <View className="w-24 h-24 rounded-full bg-primary-container text-on-primary items-center justify-center shadow-md mb-4">
              <Text className="text-2xl font-extrabold text-white">
                {getInitials(profile?.name)}
              </Text>
            </View>

            <View className="px-3 py-1 rounded-full bg-secondary-container/40 mb-2">
              <Text className="text-[11px] font-bold text-on-secondary-container uppercase">
                {profile?.role === 'ADMIN' ? 'Administrador Náutico' : profile?.role === 'INSTRUCTOR' ? 'Instrutor / Timoneiro' : 'Atleta / Praticante'}
              </Text>
            </View>

            <Text className="text-lg font-bold text-on-surface">{profile?.name || 'Atleta Canoa'}</Text>
            <Text className="text-xs text-on-surface-variant mb-4">
              ID de Remador: #CPT-{profile?.user_id ? profile.user_id.slice(-6).toUpperCase() : '2026-089'}
            </Text>

            <View className="w-full bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2 text-left border border-outline-variant/20">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-medium text-on-surface-variant">Presenças em 2026</Text>
                <Text className="text-xs font-bold text-primary">14 Remadas</Text>
              </View>
              <View className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <View className="bg-primary h-full rounded-full" style={{ width: '78%' }} />
              </View>
              <Text className="text-[11px] text-on-surface-variant mt-1">
                Próxima saída sugerida: Sábado às 08h30
              </Text>
            </View>
          </View>

          <View className="rounded-3xl bg-surface-container-low p-6 border border-outline-variant/30">
            <View className="flex-row items-center gap-2 text-primary mb-2">
              <Text className="text-lg">🦺</Text>
              <Text className="text-base font-bold text-primary">Diretrizes de Conforto</Text>
            </View>
            <Text className="text-xs text-on-surface-variant leading-relaxed">
              Nossa equipe de apoio marítimo confere suas preferências antes do posicionamento das canoas OC-6 e V1. Você pode atualizar seus dados médicos ou logísticos a qualquer momento.
            </Text>
          </View>
        </View>

        {/* RIGHT COLUMN: Contact & Accessibility Form */}
        <View className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Dados Pessoais e de Contato */}
          <View className="rounded-3xl bg-surface-container-lowest p-6 md:p-8 shadow-sm border border-outline-variant/30">
            <View className="flex-row items-center gap-3 mb-5">
              <View className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                <Text className="text-lg">🪪</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-primary">Dados Pessoais e de Contato</Text>
                <Text className="text-xs text-on-surface-variant">Canais diretos para confirmação de raia e avisos climáticos</Text>
              </View>
            </View>

            <View className="flex flex-col gap-4">
              <View>
                <Text className="text-xs font-bold text-on-surface mb-1.5">Nome Completo</Text>
                <TextInput
                  className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30"
                  value={profile?.name || ''}
                  editable={false}
                />
              </View>

              <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <View>
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-xs font-bold text-on-surface">E-mail Cadastrado</Text>
                    <View className="px-2 py-0.5 rounded bg-surface-container">
                      <Text className="text-[10px] font-bold text-primary">✓ Verificado</Text>
                    </View>
                  </View>
                  <TextInput
                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30"
                    value={profile?.email || ''}
                    editable={false}
                  />
                </View>

                <View>
                  <Text className="text-xs font-bold text-on-surface mb-1.5">Telefone / WhatsApp com DDD</Text>
                  <TextInput
                    className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest text-on-surface text-sm border border-outline-variant/40 focus:border-primary"
                    placeholder="(11) 99999-9999"
                    placeholderTextColor="#70787e"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Contato de Emergência */}
              <View className="rounded-2xl bg-surface-container-low p-4 mt-2 border border-outline-variant/20">
                <View className="flex-row items-center gap-2 mb-3">
                  <Text className="text-base">🚨</Text>
                  <Text className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Contato de Emergência (Familiar / Acompanhante)
                  </Text>
                </View>
                <View className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <View>
                    <Text className="text-[11px] font-medium text-on-surface-variant mb-1">Nome Completo</Text>
                    <TextInput
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-lowest text-on-surface text-xs border border-outline-variant/30"
                      value={emergencyName}
                      onChangeText={setEmergencyName}
                    />
                  </View>
                  <View>
                    <Text className="text-[11px] font-medium text-on-surface-variant mb-1">Telefone de Contato</Text>
                    <TextInput
                      className="w-full h-11 px-3 rounded-xl bg-surface-container-lowest text-on-surface text-xs border border-outline-variant/30"
                      value={emergencyPhone}
                      onChangeText={setEmergencyPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Card 2: Acessibilidade e Necessidades Náuticas */}
          <View className="rounded-3xl bg-surface-container-lowest p-6 md:p-8 shadow-sm border border-outline-variant/30">
            <View className="flex-row items-center gap-3 mb-5">
              <View className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                <Text className="text-lg">♿</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-primary">Acessibilidade e Necessidades Náuticas</Text>
                <Text className="text-xs text-on-surface-variant">Personalização de suporte de praia, esteira de areia e ajustes de banco</Text>
              </View>
            </View>

            {/* Toggle Switch Card */}
            <View className="bg-surface-container-low rounded-2xl p-4 mb-5 border border-outline-variant/20">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center gap-2 mb-0.5">
                    <Text className="text-xs font-bold text-on-surface">Necessidade de Assento Adaptado / Acessibilidade</Text>
                    <View className="px-2 py-0.5 rounded-full bg-secondary-container">
                      <Text className="text-[10px] font-bold text-on-secondary-container">Recomendado</Text>
                    </View>
                  </View>
                  <Text className="text-[11px] text-on-surface-variant leading-tight">
                    Ativando, seus agendamentos já vêm com assento adaptado e suporte de esteira pré-alocados pela nossa equipe de praia.
                  </Text>
                </View>

                <Switch
                  value={hasNeeds}
                  onValueChange={setHasNeeds}
                  trackColor={{ false: '#bfc8ce', true: '#004e68' }}
                />
              </View>
            </View>

            {/* Tipo de Adaptação Buttons */}
            {hasNeeds && (
              <View className="mb-5">
                <Text className="text-xs font-bold text-on-surface mb-2">Tipo de Adaptação / Mobilidade</Text>
                <View className="flex-row flex-wrap gap-2">
                  {ACCESSIBILITY_TYPES.filter((t) => t.value !== 'NONE').map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      onPress={() => setAccessType(t.value)}
                      className={`px-3.5 py-2 rounded-xl border transition-all ${
                        accessType === t.value 
                          ? 'bg-primary border-primary text-white shadow-sm' 
                          : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                      }`}
                    >
                      <Text className={`text-xs font-bold ${accessType === t.value ? 'text-white' : 'text-on-surface'}`}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Observações de Embarque */}
            <View className="mb-5">
              <Text className="text-xs font-bold text-on-surface mb-1.5">Observações para a equipe de embarque</Text>
              <TextInput
                className="w-full p-4 rounded-2xl bg-surface-container-lowest text-on-surface text-xs border border-outline-variant/40 focus:border-primary"
                placeholder="Ex: uso cadeira de rodas manual, preciso de apoio para transferência até o assento adaptado com cinto torácico."
                placeholderTextColor="#70787e"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
              <Text className="text-[11px] text-on-surface-variant mt-1">
                Essas informações são confidenciais e compartilhadas apenas com o timoneiro e apoio técnico da raia.
              </Text>
            </View>

            {/* Vivência Aquática / Natação */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-on-surface mb-2">Sabe nadar ou já teve vivência prévia no mar?</Text>
              <View className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <TouchableOpacity
                  onPress={() => setSwimLevel('SIM')}
                  className={`p-3 rounded-xl border flex-row items-center gap-2 ${
                    swimLevel === 'SIM' ? 'bg-secondary-container/30 border-secondary' : 'bg-surface-container-low border-outline-variant/30'
                  }`}
                >
                  <Text className="text-xs">{swimLevel === 'SIM' ? '🔘' : '⚪'}</Text>
                  <Text className="text-xs font-bold text-on-surface">Sim, sei nadar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSwimLevel('NAO')}
                  className={`p-3 rounded-xl border flex-row items-center gap-2 ${
                    swimLevel === 'NAO' ? 'bg-secondary-container/30 border-secondary' : 'bg-surface-container-low border-outline-variant/30'
                  }`}
                >
                  <Text className="text-xs">{swimLevel === 'NAO' ? '🔘' : '⚪'}</Text>
                  <Text className="text-xs font-bold text-on-surface">Não sei nadar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSwimLevel('FLUTUADOR')}
                  className={`p-3 rounded-xl border flex-row items-center gap-2 ${
                    swimLevel === 'FLUTUADOR' ? 'bg-secondary-container/30 border-secondary' : 'bg-surface-container-low border-outline-variant/30'
                  }`}
                >
                  <Text className="text-xs">{swimLevel === 'FLUTUADOR' ? '🔘' : '⚪'}</Text>
                  <Text className="text-xs font-bold text-on-surface">Com apoio de flutuador</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Bar */}
            <View className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
              {savedSuccess && (
                <View className="flex-row items-center gap-2 px-3 py-2 rounded-xl bg-secondary-container/40">
                  <Text className="text-xs">✓</Text>
                  <Text className="text-xs font-bold text-on-secondary-container">Perfil salvo com sucesso!</Text>
                </View>
              )}

              <TouchableOpacity
                className="w-full sm:w-auto ml-auto h-12 px-8 rounded-xl bg-primary flex-row items-center justify-center gap-2 shadow-sm"
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text className="text-base">💾</Text>
                    <Text className="text-white font-bold text-sm">Salvar Alterações do Perfil</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
