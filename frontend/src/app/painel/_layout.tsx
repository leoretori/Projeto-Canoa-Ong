import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, Text, Platform, View, Image, useWindowDimensions } from 'react-native';
import { getCurrentUserRole, getCurrentUserEmail, signOut } from '../../services/auth';
import { isPrivilegedRole } from '../../utils/roles';
import { showAlert } from '../../utils/alert';
import { ThemeToggle } from '../../components/ThemeToggle';

const CPT_LOGO = require('../../../assets/images/cpt-logo.png');

export default function TabsLayout() {
  const router = useRouter();
  const [role, setRole] = useState<string>('ATHLETE');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUserRole().then(setRole);
    getCurrentUserEmail().then(setEmail);
  }, []);

  const isPrivileged = isPrivilegedRole(role);
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  const goToPortal = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      router.replace('/');
    }
  };

  const doLogout = () => {
    signOut();
    if (Platform.OS === 'web') {
      // Garante reset completo da navegação no browser (evita tela presa após logout).
      window.location.href = '/';
    } else {
      router.replace('/');
    }
  };

  const handleLogout = () => {
    showAlert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: doLogout },
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#004e68',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
        tabBarStyle: {
          borderTopColor: '#E2E8F0',
          height: 74,
          paddingBottom: 14,
          paddingTop: 6,
        },
        headerTitleAlign: 'center',
        headerTitleStyle: { fontSize: 17, fontWeight: '700', color: '#004e68' },
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12, gap: 8 }}>
            {isWide ? (
              <Image
                source={CPT_LOGO}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ffffff' }}
                resizeMode="contain"
              />
            ) : null}
            <TouchableOpacity
              onPress={goToPortal}
              accessibilityRole="link"
              accessibilityLabel="Voltar para o portal"
              style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#ebf5ff' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#004e68' }}>← Portal</Text>
            </TouchableOpacity>
          </View>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, gap: 10 }}>
            {isWide ? <ThemeToggle /> : null}
            {isWide && email ? (
              <Text style={{ fontSize: 12, color: '#64748B' }} numberOfLines={1}>
                {email}
              </Text>
            ) : null}
            <TouchableOpacity
              onPress={handleLogout}
              accessibilityRole="button"
              style={{ paddingHorizontal: 10, paddingVertical: 10 }}
            >
              <Text style={{ fontSize: 14, color: '#DC2626', fontWeight: '700' }}>Sair</Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Remadas',
          tabBarLabel: 'Remadas',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📅</Text>,
        }} 
      />
      <Tabs.Screen 
        name="my-reservations" 
        options={{ 
          title: 'Minhas vagas',
          tabBarLabel: 'Minhas vagas',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛶</Text>,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }} 
      />
      <Tabs.Screen 
        name="admin" 
        options={{ 
          title: 'Leme',
          tabBarLabel: 'Leme',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🧭</Text>,
          href: isPrivileged ? undefined : null,
        }} 
      />
    </Tabs>
  );
}
