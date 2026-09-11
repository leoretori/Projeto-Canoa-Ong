/**
 * Alert.alert do React Native não renderiza nenhuma UI real no navegador
 * (react-native-web não implementa isso). Este helper resolve isso usando
 * window.alert/confirm no web e Alert.alert nativo no iOS/Android.
 */

import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  const fullMessage = message ? `${title}\n\n${message}` : title;

  if (Platform.OS === 'web') {
    // Sem botões (ou só um botão "OK"): alerta simples.
    if (!buttons || buttons.length <= 1) {
      window.alert(fullMessage);
      buttons?.[0]?.onPress?.();
      return;
    }
    // Com confirmação (ex: "Cancelar" / "Confirmar"): usa confirm().
    // Considera o botão "destructive" ou o último como a ação positiva.
    const confirmButton = buttons.find((b) => b.style === 'destructive') || buttons[buttons.length - 1];
    if (window.confirm(fullMessage)) {
      confirmButton?.onPress?.();
    }
    return;
  }

  Alert.alert(title, message, buttons);
}
