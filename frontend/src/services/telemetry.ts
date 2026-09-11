/**
 * Módulo de Telemetria e Monitoramento de Erros e Disponibilidade
 * Pronto para integração com Sentry, CloudWatch Logs ou Datadog.
 */
import { Platform } from 'react-native';

export interface TelemetryEvent {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

export function logError(error: Error | any, context?: Record<string, any>) {
  const event: TelemetryEvent = {
    level: 'error',
    message: error?.message || String(error),
    context: {
      ...context,
      stack: error?.stack,
      platform: Platform.OS,
      userAgent: Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.userAgent : 'native',
    },
    timestamp: new Date().toISOString(),
  };

  // Log estruturado no console
  console.error('[Va\'aFlow Telemetry]', JSON.stringify(event, null, 2));

  // Em produção: envio seguro para endpoint de observabilidade (ex: Sentry / CloudWatch)
  if (process.env.EXPO_PUBLIC_TELEMETRY_ENDPOINT && Platform.OS === 'web' && typeof fetch !== 'undefined') {
    try {
      fetch(process.env.EXPO_PUBLIC_TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      }).catch(() => {});
    } catch (_) {}
  }
}

export async function checkBackendHealth(apiUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/health`, { method: 'GET' });
    return res.ok;
  } catch (err) {
    return false;
  }
}

