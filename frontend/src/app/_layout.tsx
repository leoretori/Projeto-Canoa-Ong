import { Stack, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { onSessionExpired } from '../services/auth';
import { CookieBanner } from '../components/CookieBanner';
import '../../global.css'; // Carrega os estilos do NativeWind

export { default as ErrorBoundary } from './error';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.lang = 'pt-BR';
      document.title = "Canoa Para Todos • Va'a Inclusiva em São Sebastião - SP";
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        'content',
        "Projeto social e esportivo de Canoa Polinésia (Va'a) em São Sebastião - SP. Acessibilidade e remadas adaptadas no mar."
      );
    }
    const unsubscribe = onSessionExpired(() => {
      router.replace('/');
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <Head>
        <title>Canoa Para Todos • Va'a Inclusiva em São Sebastião - SP</title>
        <meta
          name="description"
          content="Projeto social e inclusivo de Canoa Polinésia (Va'a) em São Sebastião - SP. Acessibilidade e remadas adaptadas no mar."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0284c7" />
      </Head>
      <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <CookieBanner />
    </>
  );
}
