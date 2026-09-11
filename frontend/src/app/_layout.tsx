import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { onSessionExpired } from '../services/auth';
import '../../global.css'; // Carrega os estilos do NativeWind

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      router.replace('/');
    });
    return unsubscribe;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
