import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#1E40AF' }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Calendário',
          tabBarLabel: 'Agendar'
        }} 
      />
      <Tabs.Screen 
        name="admin" 
        options={{ 
          title: 'Gestão Va\'aFlow',
          tabBarLabel: 'Admin'
        }} 
      />
    </Tabs>
  );
}

