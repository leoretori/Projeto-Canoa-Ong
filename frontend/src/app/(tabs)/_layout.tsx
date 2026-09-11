import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, Text, Platform, View } from 'react-native';
import { getCurrentUserRole, getCurrentUserEmail, signOut } from '../../services/auth';
import { showAlert } from '../../utils/alert';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function TabsLayout() {
  const router = useRouter();
  const [role, setRole] = useState<string>('ATHLETE');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUserRole().then(setRole);
    getCurrentUserEmail().then(setEmail);
  }, []);

  const isPrivileged = role === 'INSTRUCTOR' || role === 'ADMIN';

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
        tabBarActiveTintColor: '#0E7490',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 12 }}>
            <ThemeToggle />
            <TouchableOpacity onPress={handleLogout} style={{ alignItems: 'flex-end' }}>
              {email ? (
                <Text style={{ fontSize: 10, color: '#64748B' }} numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
              <Text style={{ fontSize: 13, color: '#DC2626', fontWeight: '600' }}>Sair</Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Calendário',
          tabBarLabel: 'Agendar'
        }} 
      />
      <Tabs.Screen 
        name="my-reservations" 
        options={{ 
          title: 'Minhas Remadas',
          tabBarLabel: 'Minhas Vagas'
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Meu Perfil',
          tabBarLabel: 'Perfil'
        }} 
      />
      <Tabs.Screen 
        name="admin" 
        options={{ 
          title: 'Gestão Va\'aFlow',
          tabBarLabel: 'Instrutor',
          href: isPrivileged ? undefined : null,
        }} 
      />
    </Tabs>
  );
}
