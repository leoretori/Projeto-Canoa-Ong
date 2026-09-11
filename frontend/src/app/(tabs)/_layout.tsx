import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        }
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
        name="admin" 
        options={{ 
          title: 'Gestão Va\'aFlow',
          tabBarLabel: 'Instrutor'
        }} 
      />
    </Tabs>
  );
}
